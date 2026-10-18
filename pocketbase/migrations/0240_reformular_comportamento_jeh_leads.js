/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    // 1. Enriquecer campos da coleção crm_leads para suportar histórico, qualificação comercial e resumo automático
    try {
      const leadsCol = app.findCollectionByNameOrId('crm_leads')
      if (leadsCol) {
        const fieldsToAdd = [
          { name: 'conversation_id', type: 'text' },
          { name: 'commercial_summary', type: 'text' },
          { name: 'interest_topic', type: 'text' },
          { name: 'system_current', type: 'text' },
          { name: 'operational_pains', type: 'text' },
          {
            name: 'qualification_stage',
            type: 'select',
            values: [
              'Novo Lead',
              'Em Atendimento',
              'Interessado',
              'Solicita Demonstração',
              'Encaminhado ao Comercial',
            ],
            maxSelect: 1,
          },
          {
            name: 'fill_status',
            type: 'select',
            values: ['incompleto', 'parcial', 'completo'],
            maxSelect: 1,
          },
          { name: 'first_contact_date', type: 'text' },
          { name: 'last_interaction_date', type: 'text' },
          { name: 'chat_history', type: 'json' },
        ]

        for (let i = 0; i < fieldsToAdd.length; i++) {
          const f = fieldsToAdd[i]
          if (!leadsCol.fields.getByName(f.name)) {
            leadsCol.fields.add(
              f.type === 'select'
                ? new SelectField(f)
                : f.type === 'json'
                  ? new JSONField(f)
                  : new TextField(f),
            )
          }
        }
        app.save(leadsCol)
      }
    } catch (eLeads) {
      console.log('Erro ao atualizar campos de crm_leads:', eLeads)
    }

    // 2. Criar coleção de notificações de leads (Fila administrativa de avisos)
    try {
      let notifCol = null
      try {
        notifCol = app.findCollectionByNameOrId('jeh_notifications')
      } catch (_) {}

      if (!notifCol) {
        notifCol = new Collection({
          name: 'jeh_notifications',
          type: 'base',
          listRule: "@request.auth.id != ''",
          viewRule: "@request.auth.id != ''",
          createRule: '', // Público para ser criado pelo hook
          updateRule: "@request.auth.id != ''",
          deleteRule: "@request.auth.id != ''",
          fields: [
            { name: 'lead_id', type: 'text' },
            { name: 'lead_number', type: 'text' },
            { name: 'lead_name', type: 'text' },
            { name: 'lead_company', type: 'text' },
            { name: 'lead_phone', type: 'text' },
            { name: 'lead_email', type: 'text' },
            { name: 'interest', type: 'text' },
            { name: 'commercial_summary', type: 'text' },
            { name: 'event_type', type: 'text' }, // 'lead_captured', 'demo_requested', etc.
            { name: 'notification_body', type: 'text' },
            {
              name: 'delivery_status',
              type: 'select',
              values: ['registrado', 'enviado_email', 'falha_envio'],
              maxSelect: 1,
            },
            { name: 'recipient_emails', type: 'text' },
            { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
            { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
          ],
          indexes: [
            'CREATE INDEX idx_jeh_notif_created ON jeh_notifications (created)',
            'CREATE INDEX idx_jeh_notif_status ON jeh_notifications (delivery_status)',
          ],
        })
        app.save(notifCol)
      }
    } catch (eNotif) {
      console.log('Erro ao criar jeh_notifications:', eNotif)
    }

    // 3. Persistir configurações padrão solicitadas pelo usuário em settings
    try {
      const settingsCol = app.findCollectionByNameOrId('settings')
      const defaultSettings = [
        {
          key: 'jeh_greeting_message',
          value:
            'Olá! Seja muito bem-vindo(a) ao Jetro! 😊\nEu sou a Jeh, assistente virtual do Jetro, e estou aqui para ajudar você a conhecer melhor nosso sistema.\nAntes de começarmos, gostaria de saber um pouquinho sobre você para personalizar nosso atendimento.\nQual é o seu nome?',
        },
        {
          key: 'jeh_unanswered_default_message',
          value:
            'Ainda não tenho essa confirmação específica na minha base, mas nossa equipe de especialistas pode detalhar para você pelo WhatsApp: https://wa.me/5531991297619. Enquanto isso, gostaria de conhecer outros módulos do Jetro?',
        },
        {
          key: 'jeh_lead_source',
          value: 'Chat Jeh — Site Jetro',
        },
        {
          key: 'jeh_notification_recipients',
          value: 'comercial@jetro.com.br',
        },
        {
          key: 'jeh_notification_events',
          value: 'lead_captured,demo_requested',
        },
        {
          key: 'jeh_notification_mode',
          value: 'imediato', // 'imediato' | 'consolidado'
        },
        {
          key: 'jeh_lgpd_notice',
          value:
            'Seus dados são protegidos e tratados para atendimento comercial do Jetro de acordo com a LGPD.',
        },
      ]

      for (let s = 0; s < defaultSettings.length; s++) {
        const item = defaultSettings[s]
        let rec = null
        try {
          rec = app.findFirstRecordByData('settings', 'key', item.key)
        } catch (_) {}

        if (rec) {
          rec.set('value', item.value)
          app.save(rec)
        } else {
          rec = new Record(settingsCol)
          rec.set('key', item.key)
          rec.set('value', item.value)
          app.save(rec)
        }
      }
    } catch (eSet) {
      console.log('Erro ao configurar settings da Jeh:', eSet)
    }

    // 4. Garantir que a Base de Conhecimento tenha a resposta oficial consolidada de "Como funciona o sistema?"
    try {
      const qaCol = app.findCollectionByNameOrId('jeh_qa')
      if (qaCol) {
        const howItWorksAns =
          'O Jetro é um sistema de gestão empresarial (ERP) moderno e integrado que reúne todas as áreas da empresa em uma única plataforma inteligente: Vendas e CRM, Faturamento, Fiscal (NF-e, NFC-e, NFS-e, CT-e, MDF-e), Financeiro, Estoque e Compras, Produção e Indústria (PCP), Logística e Transporte, Departamento Pessoal (DP), Recursos Humanos (RH) e Segurança do Trabalho (SST).\n\n' +
          'Ele funciona de forma totalmente modular: você ativa apenas os módulos que fazem sentido para a sua operação. Todos os departamentos conversam em tempo real, eliminando retrabalho e planilhas paralelas.\n\n' +
          'Diferenciais de destaque do Jetro:\n' +
          '• IA Nativa Jeh integrada ao fluxo de atendimento e Segundo Cérebro da empresa;\n' +
          '• Telas completas de auditoria, conformidade e rastreabilidade total;\n' +
          '• Controle rigoroso de validades e vencimentos de produtos, documentos e contratos;\n' +
          '• Gestão de frotas, motoristas e entregas com comprovação digital;\n' +
          '• Atendimento a indústrias, atacadistas, distribuidoras, transportadoras e prestadores de serviços.\n\n' +
          'Você gostaria de conhecer alguma funcionalidade específica ou entender como o Jetro poderia ajudar sua empresa?'

        let existingHow = null
        try {
          const list = app.findRecordsByFilter(
            'jeh_qa',
            "canonical_question ~ 'Como funciona'",
            '-created',
            1,
            0,
          )
          if (list && list.length > 0) existingHow = list[0]
        } catch (_) {}

        if (existingHow) {
          existingHow.set('official_answer', howItWorksAns)
          existingHow.set('category', 'O que é o Jetro')
          existingHow.set('approval_status', 'aprovado')
          existingHow.set('variations', [
            'Como funciona o sistema?',
            'Como funciona o Jetro?',
            'O que é o Jetro?',
            'Me explica como o sistema funciona',
            'Como o sistema opera?',
            'Quais áreas o Jetro atende?',
          ])
          app.save(existingHow)
        } else {
          const newQa = new Record(qaCol)
          newQa.set('canonical_question', 'Como funciona o sistema?')
          newQa.set('official_answer', howItWorksAns)
          newQa.set('category', 'O que é o Jetro')
          newQa.set('approval_status', 'aprovado')
          newQa.set('keywords', 'como funciona, jetro, erp, modulos, areas, sistema')
          newQa.set('hit_count', 0)
          newQa.set('responsible_name', 'Comercial Jetro')
          newQa.set('variations', [
            'Como funciona o sistema?',
            'Como funciona o Jetro?',
            'O que é o Jetro?',
            'Me explica como o sistema funciona',
            'Como o sistema opera?',
            'Quais áreas o Jetro atende?',
          ])
          app.save(newQa)
        }
      }
    } catch (eQa) {
      console.log('Erro ao atualizar Q&A de como funciona:', eQa)
    }
  },
  (app) => {
    // Reversão segura
  },
)
