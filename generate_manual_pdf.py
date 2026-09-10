import os
import sys
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Definição de Cores do Tema Barbearia Andrade
GOLD = colors.HexColor('#D4AF37')
GOLD_LIGHT = colors.HexColor('#F9E79F')
GOLD_DARK = colors.HexColor('#997514')
DARK_BG = colors.HexColor('#121212')
CARD_BG = colors.HexColor('#1E1E1E')
CARD_BORDER = colors.HexColor('#2E2E2E')
TEXT_WHITE = colors.HexColor('#FFFFFF')
TEXT_MUTED = colors.HexColor('#A0A0A0')
TEXT_DARK = colors.HexColor('#222222')
SUCCESS = colors.HexColor('#10B981')
PRIMARY_ACCENT = colors.HexColor('#C89B3C')

class NumberedCanvas(canvas.Canvas):
    """Canvas com numeração de página profissional e rodapé elegante"""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        # Ignora decorações padrão na capa (página 1)
        if self._pageNumber == 1:
            return

        self.saveState()
        
        # Cabeçalho
        self.setStrokeColor(colors.HexColor('#2A2A2A'))
        self.setLineWidth(0.75)
        self.line(40, 805, 555, 805)
        
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(GOLD)
        self.drawString(40, 812, "BARBEARIA ANDRADE")
        
        self.setFont("Helvetica", 8)
        self.setFillColor(TEXT_MUTED)
        self.drawRightString(555, 812, "Manual Oficial de Operação do Barbeiro")
        
        # Rodapé
        self.setStrokeColor(colors.HexColor('#2A2A2A'))
        self.line(40, 45, 555, 45)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(TEXT_MUTED)
        self.drawString(40, 32, "Saymon Andrade • Sistema Digital de Agendamento & Gestão")
        
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(555, 32, page_str)
        
        self.restoreState()


def create_manual():
    pdf_path = r"c:\Eullon\Projeto Eullon\Barbearia Andrade\Manual_Do_Aplicativo_Barbearia_Andrade.pdf"
    
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    
    # Estilos Customizados
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=TEXT_WHITE,
        alignment=1, # Centralizado
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=GOLD_LIGHT,
        alignment=1,
    )

    badge_style = ParagraphStyle(
        'CoverBadge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=GOLD,
        alignment=1,
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=GOLD_DARK,
        spaceBefore=14,
        spaceAfter=8,
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=10,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155'),
        spaceBefore=3,
        spaceAfter=4,
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#1E293B'),
        leftIndent=15,
        spaceBefore=2,
        spaceAfter=2,
    )

    card_text = ParagraphStyle(
        'CardText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#1E293B'),
    )

    highlight_box = ParagraphStyle(
        'Highlight',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#854D0E'),
    )

    story = []

    # =========================================================================
    # CAPA PROFISSIONAL
    # =========================================================================
    cover_table_data = [
        [Paragraph("<b>★ SISTEMA DIGITAL EXCLUSIVO ★</b>", badge_style)],
        [Spacer(1, 10)],
        [Paragraph("MANUAL DE OPERAÇÃO DO APLICATIVO", title_style)],
        [Spacer(1, 6)],
        [Paragraph("BARBEARIA ANDRADE", ParagraphStyle('GoldName', parent=title_style, textColor=GOLD, fontSize=28, leading=34))],
        [Spacer(1, 12)],
        [Paragraph("Guia Prático Passo a Passo para o Barbeiro <b>Saymon Andrade</b> dominar 100% da sua agenda, clientes, catálogo e faturamento.", subtitle_style)],
        [Spacer(1, 20)],
        [Paragraph("<b>Versão 1.0 • Edição 2026</b><br/>Desenvolvido especialmente para otimizar seus atendimentos e valorizar o seu trabalho", ParagraphStyle('CoverFoot', parent=subtitle_style, fontSize=9.5, textColor=TEXT_MUTED))],
    ]

    cover_table = Table(cover_table_data, colWidths=[515])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#141414')),
        ('BOX', (0, 0), (-1, -1), 2, GOLD),
        ('PADDING', (0, 0), (-1, -1), 30),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    story.append(Spacer(1, 80))
    story.append(cover_table)
    story.append(Spacer(1, 35))

    # Resumo dos Destaques na Capa
    summary_box_data = [
        [
            Paragraph("<b>• Agendamento 24 Horas</b><br/><font color='#64748B' size=8>Clientes marcam direto no WhatsApp sem te interromper durante o corte.</font>", card_text),
            Paragraph("<b>• Login VIP & Fidelidade</b><br/><font color='#64748B' size=8>Contador de visitas (X de 10) e histórico salvo pelo número do WhatsApp.</font>", card_text),
        ],
        [
            Paragraph("<b>• Feed Estilo Instagram</b><br/><font color='#64748B' size=8>Mostre seus cortes reais com o @ do cliente, curtidas e comentários.</font>", card_text),
            Paragraph("<b>• Painel Financeiro</b><br/><font color='#64748B' size=8>Controle de ganhos diários, semanais e mensais em tempo real.</font>", card_text),
        ]
    ]
    summary_table = Table(summary_box_data, colWidths=[250, 250])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(summary_table)

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 1: COMO ACESSAR O APLICATIVO
    # =========================================================================
    story.append(Paragraph("1. Como Acessar o Aplicativo", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceBefore=2, spaceAfter=10))
    
    story.append(Paragraph(
        "O sistema possui <b>dois links principais</b> que funcionam perfeitamente tanto no celular quanto no computador:",
        body_style
    ))

    links_table_data = [
        [
            Paragraph("<b>🔗 LINK DO CLIENTE</b> (Agendamento Público)", ParagraphStyle('BoldG', parent=body_style, textColor=colors.HexColor('#0F172A'), fontName='Helvetica-Bold')),
            Paragraph("<b>🔗 SEU LINK EXCLUSIVO</b> (Painel do Barbeiro)", ParagraphStyle('BoldG2', parent=body_style, textColor=colors.HexColor('#0F172A'), fontName='Helvetica-Bold'))
        ],
        [
            Paragraph(
                "• <b>Para que serve:</b> É o link oficial da sua barbearia que você coloca na <b>Bio do seu Instagram</b> e envia no WhatsApp dos clientes.<br/>"
                "• <b>Seu Link Oficial:</b><br/><b>https://barbearia-andrade.netlify.app/</b><br/>"
                "• <b>O que o cliente vê:</b> Catálogo de cortes com fotos, preços, horários disponíveis, feed de fotos, avaliações e login VIP.",
                card_text
            ),
            Paragraph(
                "• <b>Para que serve:</b> É a sua central administrativa privada. <b>Nenhum cliente tem acesso a esse painel!</b><br/>"
                "• <b>Seu Link de Barbeiro:</b><br/><b>https://barbearia-andrade.netlify.app/#/barbeiro</b><br/>"
                "• <b>O que você faz nele:</b> Vê a agenda do dia, faturamento, cadastra novos cortes, posta no feed e ajusta horários.",
                card_text
            )
        ]
    ]
    links_table = Table(links_table_data, colWidths=[250, 255])
    links_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#FEFCE8')),
        ('BACKGROUND', (1, 0), (1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (0, -1), 1, colors.HexColor('#FDE047')),
        ('BOX', (1, 0), (1, -1), 1, colors.HexColor('#CBD5E1')),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(links_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("📲 Como Instalar o App no Celular (Como se fosse da Play Store)", h2_style))
    story.append(Paragraph(
        "Você e seus clientes não precisam baixar nada pesado na loja de aplicativos! O sistema tem tecnologia <b>PWA (Progressive Web App)</b>:",
        body_style
    ))
    story.append(Paragraph("• <b>No iPhone (Safari):</b> Toque no botão de <i>Compartilhar</i> (quadradinho com seta para cima) e selecione <b>'Adicionar à Tela de Início'</b>.", bullet_style))
    story.append(Paragraph("• <b>No Android (Chrome):</b> Toque nos <i>3 pontinhos</i> no canto superior direito e selecione <b>'Instalar Aplicativo'</b> ou <b>'Adicionar à Tela Inicial'</b>.", bullet_style))
    story.append(Paragraph("• O ícone dourado da <b>Barbearia Andrade</b> ficará salvo na tela do celular, abrindo em tela cheia com 1 toque!", bullet_style))

    story.append(Spacer(1, 15))

    # =========================================================================
    # CAPÍTULO 2: EXPERIÊNCIA DO CLIENTE (PASSO A PASSO)
    # =========================================================================
    story.append(Paragraph("2. A Experiência do Cliente (Como ele agenda)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "O agendamento foi planejado para ser rápido, visual e sem burocracia. O cliente leva menos de 1 minuto para marcar:",
        body_style
    ))

    booking_steps = [
        [
            Paragraph("<b>Passo 1</b>", ParagraphStyle('P1', fontName='Helvetica-Bold', textColor=GOLD_DARK)),
            Paragraph("<b>Escolha do Corte & Turbinar:</b> O cliente escolhe o serviço principal (Degradê, Social, Barba, etc.) e pode tocar no botão <b>[ + Turbinar Corte ]</b> para adicionar Sobrancelha, Hidratação ou Pigmentação.", card_text)
        ],
        [
            Paragraph("<b>Passo 2</b>", ParagraphStyle('P2', fontName='Helvetica-Bold', textColor=GOLD_DARK)),
            Paragraph("<b>Data & Horário Inteligente:</b> Escolhe o dia (com abas 'Esta Semana' e 'Próxima Semana'). Horários ocupados ou horários de pausa/almoço ficam bloqueados automaticamente.", card_text)
        ],
        [
            Paragraph("<b>Passo 3</b>", ParagraphStyle('P3', fontName='Helvetica-Bold', textColor=GOLD_DARK)),
            Paragraph("<b>Identificação VIP & Observações:</b> O cliente coloca o Nome e o WhatsApp. Se ele já agendou antes, o sistema preenche tudo sozinho! Pode deixar recado (ex: 'fazer risco na lateral').", card_text)
        ],
        [
            Paragraph("<b>Passo 4</b>", ParagraphStyle('P4', fontName='Helvetica-Bold', textColor=GOLD_DARK)),
            Paragraph("<b>Forma de Pagamento & WhatsApp:</b> Escolhe Pix, Cartão ou Dinheiro. Ao tocar no botão dourado, abre o WhatsApp com a <b>mensagem 100% pronta e formatada</b> enviada direto para você!", card_text)
        ],
    ]
    b_table = Table(booking_steps, colWidths=[65, 440])
    b_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FAFAFA')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(b_table)

    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>★ Login VIP do Cliente & Cartão Fidelidade</b>", h2_style))
    story.append(Paragraph(
        "Diferente de sistemas chatos que exigem senha e e-mail, o seu cliente entra apenas com o <b>WhatsApp e Nome</b>. Vantagens exclusivas:",
        body_style
    ))
    story.append(Paragraph("• <b>Cartão Fidelidade Digital:</b> O cliente vê quantos cortes já fez com você (ex: <i>3 de 10 cortes</i>) e se motiva a voltar para completar os 10!", bullet_style))
    story.append(Paragraph("• <b>Histórico Completo de Cortes:</b> O cliente consegue ver todos os cortes anteriores e apertar em <b>'Repetir'</b> para agendar de novo o mesmo serviço.", bullet_style))
    story.append(Paragraph("• <b>Lembrete com 1 Toque:</b> No topo do app do cliente, aparece um aviso do agendamento ativo com botão de colocar na agenda do Google ou iPhone.", bullet_style))

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 3: PAINEL DO BARBEIRO (AS 7 ABAS DE CONTROLE)
    # =========================================================================
    story.append(Paragraph("3. Painel do Barbeiro (As 7 Abas de Gestão)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "Ao entrar no link exclusivo do barbeiro (<b>#/barbeiro</b>), você tem acesso à sua central de comando com 7 ferramentas poderosas:",
        body_style
    ))

    tabs_data = [
        [
            Paragraph("<b>1. MÉTRICAS</b>", ParagraphStyle('TB1', fontName='Helvetica-Bold', textColor=colors.HexColor('#0284C7'))),
            Paragraph(
                "• <b>Faturamento em Tempo Real:</b> Veja quanto faturou Hoje, nesta Semana e no Mês.<br/>"
                "• <b>Ticket Médio:</b> Descubra quanto cada cliente gasta em média na sua cadeira.<br/>"
                "• <b>Ranking de Cortes:</b> Saiba qual corte é o mais pedido e mais lucrativo.",
                card_text
            )
        ],
        [
            Paragraph("<b>2. AGENDA</b>", ParagraphStyle('TB2', fontName='Helvetica-Bold', textColor=colors.HexColor('#059669'))),
            Paragraph(
                "• <b>Visão dos Clientes do Dia:</b> Lista em ordem cronológica de todos os horários marcados.<br/>"
                "• <b>Chamar no WhatsApp:</b> Botão verde ao lado de cada cliente para enviar mensagem com 1 clique.<br/>"
                "• <b>Concluir Atendimento:</b> Marque o corte como 'Concluído' para somar no seu caixa e na fidelidade do cliente.",
                card_text
            )
        ],
        [
            Paragraph("<b>3. CORTES</b>", ParagraphStyle('TB3', fontName='Helvetica-Bold', textColor=colors.HexColor('#D97706'))),
            Paragraph(
                "• <b>Gerenciar Preços e Serviços:</b> Altere valores, tempo de corte ou descrição na hora.<br/>"
                "• <b>Adicionar Novos Serviços:</b> Cadastre Barba, Selagem, Platinado, Pacotes Especiais, etc.<br/>"
                "• <b>Turbinar com Adicionais:</b> Gerencie os extras (ex: sobrancelha +R$ 10, hidratação +R$ 15).",
                card_text
            )
        ],
        [
            Paragraph("<b>4. FEED INSTA</b>", ParagraphStyle('TB4', fontName='Helvetica-Bold', textColor=colors.HexColor('#DB2777'))),
            Paragraph(
                "• <b>Seu Instagram Próprio:</b> Poste as fotos dos melhores cortes realizados na barbearia.<br/>"
                "• <b>Opção Foto Inteira ou Recortada:</b> Você escolhe se quer recortar em quadrado ou postar a foto completa sem corte.<br/>"
                "• <b>Marcar o @ do Cliente:</b> Coloque o @ do Instagram do cliente na foto para ele se sentir valorizado!<br/>"
                "• <b>Editar e Excluir:</b> Botões rápidos para gerenciar qualquer publicação quando quiser.",
                card_text
            )
        ],
        [
            Paragraph("<b>5. CORES & FOTOS</b>", ParagraphStyle('TB5', fontName='Helvetica-Bold', textColor=colors.HexColor('#7C3AED'))),
            Paragraph(
                "• <b>Troca de Visual:</b> Mude o tema entre Dourado Real, Verde Esmeralda, Prata Titânio, Âmbar Whisky ou Rubi Nobre com 1 toque.<br/>"
                "• <b>Sua Foto de Perfil & Logo:</b> Envie sua foto profissional e a foto da sua barbearia.",
                card_text
            )
        ],
        [
            Paragraph("<b>6. HORÁRIOS</b>", ParagraphStyle('TB6', fontName='Helvetica-Bold', textColor=colors.HexColor('#475569'))),
            Paragraph(
                "• <b>Dias de Atendimento:</b> Escolha quais dias você abre (Segunda a Sábado, Folga no Domingo, etc.).<br/>"
                "• <b>Pausa Rápida (Almoço/Café):</b> Botão no topo do painel para pausar 30 minutos sem receber agendamentos surpresa.<br/>"
                "• <b>Modo Férias:</b> Bloqueia a agenda inteira com 1 toque enquanto você estiver viajando ou descansando.",
                card_text
            )
        ],
        [
            Paragraph("<b>7. BARBEARIA</b>", ParagraphStyle('TB7', fontName='Helvetica-Bold', textColor=colors.HexColor('#B45309'))),
            Paragraph(
                "• <b>Endereço & Google Maps:</b> Botão automático que puxa o GPS e cria a rota no mapa para novos clientes chegarem sem se perder.<br/>"
                "• <b>Chave Pix:</b> Cadastre sua chave Pix para aparecer no resumo de pagamento dos clientes.<br/>"
                "• <b>Comodidades:</b> Ative o que você oferece (Wi-Fi grátis, Café, Ar-condicionado, TV/Videogame, Estacionamento).",
                card_text
            )
        ],
    ]

    tabs_table = Table(tabs_data, colWidths=[120, 385])
    tabs_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFFFFF')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(tabs_table)

    story.append(PageBreak())

    # =========================================================================
    # CAPÍTULO 4: DICAS PRÁTICAS PARA LOTAR A BARBEARIA
    # =========================================================================
    story.append(Paragraph("4. Roteiro Prático: Como Divulgar e Lotar a Agenda", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=GOLD, spaceBefore=2, spaceAfter=10))

    story.append(Paragraph(
        "Para ter o máximo de resultado desde o primeiro dia de teste, siga estes 3 passos simples:",
        body_style
    ))

    strategy_data = [
        [
            Paragraph("<b>1. Colocar o Link na Bio do Instagram</b>", ParagraphStyle('S1', fontName='Helvetica-Bold', textColor=GOLD_DARK)),
        ],
        [
            Paragraph(
                "No seu perfil do Instagram, edite a biografia e coloque:<br/>"
                "• <b>Barbearia Andrade | Saymon Andrade</b><br/>"
                "• <i>Especialista em Degradê, Barba & Visagismo</i><br/>"
                "• Agende seu horário online em menos de 1 minuto:<br/>"
                "• <b>https://barbearia-andrade.netlify.app/</b>",
                card_text
            )
        ],
        [
            Paragraph("<b>2. Mensagem Pronta para enviar aos Clientes no WhatsApp</b>", ParagraphStyle('S2', fontName='Helvetica-Bold', textColor=GOLD_DARK)),
        ],
        [
            Paragraph(
                "Mande para os seus contatos que costumam cortar cabelo com você:<br/>"
                "<i>'Fala meu amigo, tudo bem? Passando para avisar que agora a Barbearia Andrade tá com aplicativo próprio de agendamento! Ficou muito mais rápido para você escolher o corte, ver os horários livres e marcar direto. Além disso, a cada corte você ganha pontos no Cartão Fidelidade! Clica aqui para conferir: https://barbearia-andrade.netlify.app/'</i>",
                card_text
            )
        ],
        [
            Paragraph("<b>3. Poste no Feed do App a cada corte diferenciado</b>", ParagraphStyle('S3', fontName='Helvetica-Bold', textColor=GOLD_DARK)),
        ],
        [
            Paragraph(
                "Terminou um corte top? Tire uma foto com boa iluminação, abra a aba <b>Feed Insta</b> no painel e poste marcando o @ do cliente. Os outros clientes adoram entrar no app para ver os cortes e se inspirar no próximo estilo!",
                card_text
            )
        ]
    ]

    strat_table = Table(strategy_data, colWidths=[505])
    strat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FEFCE8')),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#FEFCE8')),
        ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#FEFCE8')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(strat_table)

    story.append(Spacer(1, 20))

    # Mensagem de Sucesso no Final
    final_box = [
        [Paragraph("<b>★ Pronto para Começar! ★</b>", ParagraphStyle('FTitle', fontName='Helvetica-Bold', fontSize=12, textColor=GOLD_DARK, alignment=1))],
        [Spacer(1, 4)],
        [Paragraph("Esse aplicativo foi criado para economizar o seu tempo no WhatsApp, organizar seus atendimentos e valorizar o seu trabalho. Aproveite ao máximo todas as ferramentas e tenha excelentes atendimentos!", ParagraphStyle('FBody', fontName='Helvetica', fontSize=9.5, leading=14, textColor=colors.HexColor('#334155'), alignment=1))]
    ]
    final_table = Table(final_box, colWidths=[505])
    final_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1.5, GOLD),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(final_table)

    # Constrói o PDF com o NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF criado com sucesso em: {pdf_path}")

if __name__ == '__main__':
    create_manual()
