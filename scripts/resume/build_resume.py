from pathlib import Path
import json
import sys
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from html import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4

ROOT=Path(__file__).resolve().parents[2]
RU='--ru' in sys.argv
OUT=ROOT/('output/pdf/Denis-Sirashev-Resume-RU.pdf' if RU else 'output/pdf/Denis-Sirashev-Resume.pdf')
translations=json.loads((ROOT/'scripts/resume/ru.json').read_text()) if RU else {}
def tr(text):
 if not RU: return text
 for prefix, value in translations.items():
  if text.startswith(prefix): return value
 return text.replace(' - Present',' - настоящее время').replace('In development','В разработке').replace('Working development preview:','Рабочая dev-версия:').replace('International clients, remote','Международные клиенты, удалённо').replace('Spain, remote','Испания, удалённо').replace('Moscow','Москва').replace('Russia','Россия').replace('Remote','Удалённо').replace('Mar ','Март ').replace('Jun ','Июнь ').replace('Nov ','Ноябрь ').replace('Feb ','Февраль ').replace('Apr ','Апрель ')
if RU:
 pdfmetrics.registerFont(TTFont('ResumeArial','/System/Library/Fonts/Supplemental/Arial.ttf'))
 pdfmetrics.registerFont(TTFont('ResumeArial-Bold','/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
 pdfmetrics.registerFontFamily('ResumeArial',normal='ResumeArial',bold='ResumeArial-Bold',italic='ResumeArial',boldItalic='ResumeArial-Bold')
styles={
 'name':ParagraphStyle('name',fontName='Helvetica-Bold',fontSize=23,leading=27,spaceAfter=5),
 'title':ParagraphStyle('title',fontName='Helvetica-Bold',fontSize=11,leading=14,spaceAfter=5),
 'contact':ParagraphStyle('contact',fontName='Helvetica',fontSize=9,leading=12,spaceAfter=3),
 'section':ParagraphStyle('section',fontName='Helvetica-Bold',fontSize=11,leading=14,spaceBefore=12,spaceAfter=6,textColor=colors.HexColor('#8a421f')),
 'job':ParagraphStyle('job',fontName='Helvetica-Bold',fontSize=10.2,leading=13,spaceBefore=6,spaceAfter=2),
 'meta':ParagraphStyle('meta',fontName='Helvetica',fontSize=9,leading=11.5,spaceAfter=5,textColor=colors.HexColor('#505050')),
 'body':ParagraphStyle('body',fontName='Helvetica',fontSize=9.5,leading=12.5,spaceAfter=5),
 'bullet':ParagraphStyle('bullet',fontName='Helvetica',fontSize=9.5,leading=12.5,leftIndent=10,firstLineIndent=-10,spaceAfter=4),
}
if RU:
 for style in styles.values():
  style.fontName='ResumeArial-Bold' if style.fontName=='Helvetica-Bold' else 'ResumeArial'
 styles['body'].fontSize=9.3
 styles['bullet'].fontSize=9.3
 styles['body'].leading=12
 styles['bullet'].leading=12
story=[]; md=[]
def p(text,style='body'):
 text=tr(text)
 story.append(Paragraph(text,styles[style]));md.append(text)
def section(text):p(text,'section')
def job(title,meta,bullets):
 title=tr(title);meta=tr(meta);bullets=[tr(b) for b in bullets]
 story.append(KeepTogether([Paragraph(title,styles['job']),Paragraph(meta,styles['meta']),Paragraph('- '+bullets[0],styles['bullet'])]));md.extend([title,meta,'- '+bullets[0]])
 for text in bullets[1:]:p('- '+text,'bullet')

def link(url,label):return f'<link href="{escape(url,quote=True)}" color="#25394a">{escape(label)}</link>'
p('Denis Sirashev','name')
p('Senior Software Engineer | Fullstack | Applied AI &amp; Agent Engineering','title')
p('React, TypeScript, Node.js, NestJS | 12+ years of commercial development','contact')
p(link('mailto:6akcuk@gmail.com','6akcuk@gmail.com')+' | +7 (965) 657-76-51 | '+link('https://sirashev.com','sirashev.com'),'contact')
p(link('https://www.linkedin.com/in/denis-sirashev','linkedin.com/in/denis-sirashev')+' | '+link('https://github.com/6akcuk','github.com/6akcuk'),'contact')
p('Russia, UTC+5 | Remote or relocation; visa sponsorship required for relocation','contact')
section('SUMMARY')
p('Senior software engineer delivering web, desktop and mobile features from architecture through release. Shipped multi-account and AI-generation workflows at Linked Helper, authentication and onboarding systems at Yandex Market, and independently built a vaccination-booking platform serving an estimated 100,000+ patients. Now also building software with coding agents: multi-agent coordination, agent harnesses, human-in-the-loop review and AI processing pipelines.')
section('CORE SKILLS')
p('<b>Frontend:</b> React, TypeScript, JavaScript, React Native, Electron, HTML, CSS<br/><b>Backend &amp; data:</b> Node.js, NestJS, Express, REST APIs, PostgreSQL, Redis, BullMQ<br/><b>Quality &amp; delivery:</b> Jest, Cypress, Storybook, Git, Docker, CI/CD, type checking, linting<br/><b>Applied AI:</b> Claude Code, multi-agent workflows, AFK/HITL, agent harnesses, GitHub Issues, self-hosted Qwen')
section('PROFESSIONAL EXPERIENCE')
job('Linked Helper | Fullstack Developer','Mar 2025 - Jun 2026 | Remote',[
'Shipped multi-account support in an Electron app, reworking React architecture, contexts, API requests and exports so users could work with campaigns and messages across accounts.',
'Migrated account administration, access controls, billing and promo forms to workspaces, including NestJS backend promo logic.',
'Delivered production AI reply and outbound-message generation: configuration UI, service integration, token calculation and charging.',
'Introduced Storybook, adapted Webpack and migrated to React 18 while resolving incompatible UI dependencies. Added Jest coverage for backend features and fixes.'
])
job('Yandex Market | Software Engineer, Interfaces','Nov 2022 - Feb 2025 | Moscow',[
'Unified 19 authentication entry points; the mechanism was adopted by Market B2B. Added a reusable popup authentication action; internal 11.11 analytics showed approximately 10% relative improvement in authentication conversion.',
'Extended onboarding across Market, Market B2B and Yandex Go. Built an internal queue emulator for eligibility rules, user states and display timing, supporting growth from 2-4 to about 20 concurrent campaigns.',
'Brought CLS and FCP within target thresholds through layout stabilization, prerendering and deferred loading; validated with Lighthouse and internal monitoring.',
'Investigated on-call incidents using ClickHouse logs and independently conducted 30+ coding interviews with hiring recommendations.'
])
job('Playtomic | Senior Frontend Developer','Apr 2020 - Jun 2022 | Spain, remote',[
'Built and launched a sports-club TV interface for match statistics, standings and schedules. Developed administrative payment interfaces and pricing rules by date, area, sport and player count.',
'Migrated payments, schedules and court management to a feature-based architecture. Prototyped a Cypress API record/replay plugin for backend timeout failures; validated stability on two tests.'
])
story.append(PageBreak());md.append('\n--- PAGE 2 ---\n')
section('EARLIER EXPERIENCE')
job('Independent Software Engineer | Client contracts via Upwork','Jun 2015 - Mar 2020 | International clients, remote',[
'Knkt Interactive, Australia: independently built and launched a nationwide vaccination-booking platform covering clinics, slots, nurses, invitations and patient booking; served an estimated 100,000+ patients.',
'Exit Intelligence, US: built a React campaign analytics portal and Laravel API, with MySQL-compatible AWS Aurora aggregates refreshed every 15-30 minutes. Built a production email service integrating Mailchimp, SendGrid and campaign actions.',
'ScoreMore Mobile, US: built a React Native app, database and AWS AppSync schema for surveys, prize draws, events and quizzes. Left before production launch.'
])
job('Danila-master | Fullstack Developer, later Team Lead','2014 - Jun 2015 | Russia',[
'Built an AngularJS 1.x configurator with a custom image-sequence rotation carousel and Canvas rendering for inscriptions, icons and symbols, plus compatibility rules and calculated pricing.',
'Created database tables and relationships and configuration forms for administrators and managers. Built a Yii manager portal and maintained the OpenCart store.',
'Led three direct reports, handling hiring, task allocation, code review and technical decisions.'
])
section('SELECTED PERSONAL PROJECTS')
job('Ryab | City-event map with local AI processing','2026 - Present | Working development preview: '+link('https://dev.ryab.io','dev.ryab.io'),[
'Define requirements and architecture, direct implementation with coding agents, validate workflows and own performance and deployment. Stack: React, React Native, TypeScript, MapLibre, Node.js, Express, PostgreSQL, Redis and BullMQ.',
'Set up local Qwen text and media processing, connecting Yandex Cloud to a GPU node through WireGuard; run media jobs asynchronously with BullMQ.',
'Directed migration from JavaScript/CPU processing to WebGL: frame processing fell from 1,445 to 196 ms; one-minute video processing from 349 to 138 seconds. Development benchmarks used identical hardware, inputs and models.'
])
job('StarTrack | Family tasks, stars and rewards','2026 - Present | In development | React Native, Expo, TypeScript, Firebase',[
'Build a family app with coding agents: parent approvals, per-child balances, rewards and photo/video proof. Cloud Functions update completion status, balances and ledger records transactionally; access rules separate families and roles.',
'Use AFK execution for scoped tasks and HITL for requirements, architecture and review; coordinate multiple agents through GitHub Issues. Supply repository instructions and code examples, with typecheck, lint and tests as feedback loops.'
])
section('ENGINEERING WRITING')
p(link('https://dev.to/6akcuk/how-i-split-a-week-long-task-into-9-ai-sessions-and-shipped-it-in-2-days-3m3h','How I Split a Week-Long Task Into 9 AI Sessions and Shipped It in 2 Days')+'<br/>A published account of requirements analysis, task decomposition, fresh agent sessions, architecture review and automated checks. Two-day delivery compared with my initial estimate of a week or more.')
section('ADDITIONAL TECHNOLOGIES')
p('PHP, Laravel, Yii, AngularJS 1.x, Canvas, GraphQL, AWS AppSync, MySQL/Aurora, Firebase, MapLibre, WebGL, ClickHouse, Docker Compose, AWS, Yandex Cloud')
section('EDUCATION &amp; LANGUAGES')
p('Ufa State Aviation Technical University | Industrial Electronics, Engineer qualification | 2010<br/>English: B2 | Russian: native')
def footer(canvas,doc):
 canvas.setFont('ResumeArial' if RU else 'Helvetica',8);canvas.setFillColor(colors.HexColor('#666666'));canvas.drawRightString(A4[0]-40,23,f'{"Денис Сирашев" if RU else "Denis Sirashev"} | {doc.page}')
doc=SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=40,leftMargin=40,topMargin=31,bottomMargin=35,title=('Денис Сирашев - Senior Software Engineer' if RU else 'Denis Sirashev - Senior Software Engineer'),author='Denis Sirashev')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
OUT.with_suffix('.txt').write_text('\n\n'.join(md))
print(OUT)
