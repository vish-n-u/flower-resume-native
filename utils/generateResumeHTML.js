const esc = (v) =>
  String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const fmt = (d) => {
  if (!d) return ''
  const [y, m] = d.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

const ach = (a) => (typeof a === 'string' ? a : a?.title || '')

const MAIL = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;flex-shrink:0"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`
const PHONE = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;flex-shrink:0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.52 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 5.93 5.93l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`
const MAPPIN = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;flex-shrink:0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`
const LINKEDIN = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;flex-shrink:0"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`
const GLOBE = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;flex-shrink:0"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>`

const BASE_CSS = `
  .border-l-3 { border-left-width: 3px; }
  .quill-content p { margin: 0; }
  .quill-content ul { list-style: disc; padding-left: 1.25rem; }
  .quill-content ol { list-style: decimal; padding-left: 1.25rem; }
  .quill-content strong { font-weight: 600; }
  .quill-content em { font-style: italic; }
`

const wrap = (body) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>${BASE_CSS}</style>
</head>
<body class="bg-white">${body}</body>
</html>`

// ── Classic ───────────────────────────────────────────────────────────────────
function classic(data, ac, sv) {
  const p = data.personal_info || {}
  return wrap(`
<div class="max-w-4xl mx-auto p-[0.3in] bg-white text-gray-800 leading-snug text-[11pt]">
  <header class="text-center mb-2 pb-1.5 border-b-2" style="border-color:${esc(ac)}">
    <h1 class="text-[18pt] font-bold mb-1.5" style="color:${esc(ac)}">${esc(p.full_name || 'Your Name')}</h1>
    <div class="flex flex-wrap justify-center gap-3 text-[10pt] text-gray-600">
      ${p.email ? `<div class="flex items-center gap-1">${MAIL}<span>${esc(p.email)}</span></div>` : ''}
      ${p.phone ? `<div class="flex items-center gap-1">${PHONE}<span>${esc(p.phone)}</span></div>` : ''}
      ${p.location ? `<div class="flex items-center gap-1">${MAPPIN}<span>${esc(p.location)}</span></div>` : ''}
      ${p.linkedin ? `<div class="flex items-center gap-1">${LINKEDIN}<span class="break-all">${esc(p.linkedin)}</span></div>` : ''}
      ${p.website ? `<div class="flex items-center gap-1">${GLOBE}<span class="break-all">${esc(p.website)}</span></div>` : ''}
    </div>
  </header>

  ${data.professional_summary && sv.summary ? `
  <section class="mb-2">
    <h2 class="text-[12pt] font-semibold mb-1" style="color:${esc(ac)}">SUMMARY</h2>
    <div class="text-[11pt] text-gray-700 leading-snug quill-content">${data.professional_summary}</div>
  </section>` : ''}

  ${data.experience?.length > 0 && sv.experience ? `
  <section class="mb-2">
    <h2 class="text-[12pt] font-semibold mb-1" style="color:${esc(ac)}">EXPERIENCE</h2>
    <div class="space-y-1.5">
      ${data.experience.map(exp => `
      <div class="experience-item border-l-3 pl-4" style="border-color:${esc(ac)}">
        <div class="flex justify-between items-start mb-1">
          <div>
            <h3 class="text-[11pt] font-semibold text-gray-900">${esc(exp.position)}</h3>
            <p class="text-[11pt] text-gray-700 font-medium">${esc(exp.company)}</p>
          </div>
          <div class="text-right text-[10pt] text-gray-600">
            <p>${esc(fmt(exp.start_date))} - ${exp.is_current ? 'Present' : esc(fmt(exp.end_date))}</p>
          </div>
        </div>
        ${exp.description ? `<div class="text-[11pt] text-gray-700 leading-snug quill-content">${exp.description}</div>` : ''}
      </div>`).join('')}
    </div>
  </section>` : ''}

  ${data.project?.length > 0 && sv.projects ? `
  <section class="mb-2">
    <h2 class="text-[12pt] font-semibold mb-1" style="color:${esc(ac)}">PROJECTS</h2>
    <ul class="space-y-1">
      ${data.project.map(proj => `
      <div class="project-item flex justify-between items-start border-l-3 border-gray-300 pl-6">
        <div>
          <li class="text-[11pt] font-semibold text-gray-800">${esc(proj.name)}</li>
          ${proj.description ? `<div class="text-[11pt] text-gray-600 quill-content">${proj.description}</div>` : ''}
        </div>
      </div>`).join('')}
    </ul>
  </section>` : ''}

  ${data.education?.length > 0 && sv.education ? `
  <section class="mb-2">
    <h2 class="text-[12pt] font-semibold mb-1" style="color:${esc(ac)}">EDUCATION</h2>
    <div class="space-y-1.5">
      ${data.education.map(edu => `
      <div class="education-item flex justify-between items-start">
        <div>
          <h3 class="text-[11pt] font-semibold text-gray-900">${esc(edu.degree)}${edu.field ? ` in ${esc(edu.field)}` : ''}</h3>
          <p class="text-[11pt] text-gray-700">${esc(edu.institution)}</p>
          ${edu.gpa ? `<p class="text-[11pt] text-gray-600">GPA: ${esc(edu.gpa)}</p>` : ''}
        </div>
        <div class="text-[10pt] text-gray-600"><p>${esc(fmt(edu.graduation_date))}</p></div>
      </div>`).join('')}
    </div>
  </section>` : ''}

  ${data.skills?.length > 0 && sv.skills ? `
  <section class="mb-2">
    <h2 class="text-[12pt] font-semibold mb-1" style="color:${esc(ac)}">CORE SKILLS</h2>
    <div class="flex gap-4 flex-wrap">
      ${data.skills.map(s => `<div class="text-[11pt] text-gray-700">• ${esc(s)}</div>`).join('')}
    </div>
  </section>` : ''}

  ${data.certifications?.length > 0 && sv.certifications ? `
  <section class="mb-2">
    <h2 class="text-[12pt] font-semibold mb-1" style="color:${esc(ac)}">CERTIFICATIONS</h2>
    <div class="space-y-1.5">
      ${data.certifications.map(cert => `
      <div class="border-l-3 pl-4" style="border-color:${esc(ac)}">
        <h3 class="text-[11pt] font-semibold text-gray-900">${esc(cert.name)}</h3>
        ${cert.issuer ? `<p class="text-[11pt] text-gray-700">${esc(cert.issuer)}</p>` : ''}
        ${cert.date ? `<p class="text-[10pt] text-gray-600">${esc(fmt(cert.date))}</p>` : ''}
      </div>`).join('')}
    </div>
  </section>` : ''}

  ${data.achievements?.length > 0 && sv.achievements ? `
  <section class="mb-2">
    <h2 class="text-[12pt] font-semibold mb-1" style="color:${esc(ac)}">ACHIEVEMENTS</h2>
    <ul class="space-y-1">
      ${data.achievements.map(a => `<li class="text-[11pt] text-gray-700 pl-4">• ${esc(ach(a))}</li>`).join('')}
    </ul>
  </section>` : ''}

  ${data.custom_sections?.length > 0 && sv.customSections
    ? data.custom_sections.filter(s => s.section_name && s.content).map(s => `
  <section class="mb-2">
    <h2 class="text-[12pt] font-semibold mb-1" style="color:${esc(ac)}">${esc(s.section_name.toUpperCase())}</h2>
    <div class="text-[11pt] text-gray-700 leading-snug quill-content">${s.content}</div>
  </section>`).join('') : ''}
</div>`)
}

// ── Modern ────────────────────────────────────────────────────────────────────
function modern(data, ac, sv) {
  const p = data.personal_info || {}
  return wrap(`
<div class="max-w-4xl mx-auto bg-white text-gray-800 text-[11pt]">
  <header class="p-[0.3in] text-white" style="background-color:${esc(ac)}">
    <h1 class="text-[18pt] font-light mb-2">${esc(p.full_name || 'Your Name')}</h1>
    <div class="grid grid-cols-2 gap-1.5 text-[10pt]">
      ${p.email ? `<div class="flex items-center gap-2">${MAIL}<span>${esc(p.email)}</span></div>` : ''}
      ${p.phone ? `<div class="flex items-center gap-2">${PHONE}<span>${esc(p.phone)}</span></div>` : ''}
      ${p.location ? `<div class="flex items-center gap-2">${MAPPIN}<span>${esc(p.location)}</span></div>` : ''}
      ${p.linkedin ? `<div class="flex items-center gap-2">${LINKEDIN}<span class="break-all text-[10pt]">${esc(p.linkedin.replace('https://www.', ''))}</span></div>` : ''}
      ${p.website ? `<div class="flex items-center gap-2">${GLOBE}<span class="break-all text-[10pt]">${esc(p.website.replace('https://', ''))}</span></div>` : ''}
    </div>
  </header>

  <div class="px-[0.3in] py-4">
    ${data.professional_summary && sv.summary ? `
    <section class="mb-2">
      <h2 class="text-[12pt] font-light mb-1 pb-1 border-b border-gray-200">Summary</h2>
      <div class="text-[11pt] text-gray-700 quill-content">${data.professional_summary}</div>
    </section>` : ''}

    ${data.experience?.length > 0 && sv.experience ? `
    <section class="mb-2">
      <h2 class="text-[12pt] font-light mb-1 pb-1 border-b border-gray-200">Experience</h2>
      <div class="space-y-1.5">
        ${data.experience.map(exp => `
        <div class="experience-item relative pl-6 border-l border-gray-200">
          <div class="flex justify-between items-start mb-1">
            <div>
              <h3 class="text-[11pt] font-medium text-gray-900">${esc(exp.position)}</h3>
              <p class="text-[11pt] font-medium" style="color:${esc(ac)}">${esc(exp.company)}</p>
            </div>
            <div class="text-[10pt] text-gray-500 bg-gray-100 px-3 py-1 rounded">
              ${esc(fmt(exp.start_date))} - ${exp.is_current ? 'Present' : esc(fmt(exp.end_date))}
            </div>
          </div>
          ${exp.description ? `<div class="text-[11pt] text-gray-700 leading-snug mt-1 quill-content">${exp.description}</div>` : ''}
        </div>`).join('')}
      </div>
    </section>` : ''}

    ${data.project?.length > 0 && sv.projects ? `
    <section class="mb-2">
      <h2 class="text-[12pt] font-light mb-1 pb-1 border-b border-gray-200">Projects</h2>
      <div class="space-y-1">
        ${data.project.map(proj => `
        <div class="project-item relative pl-6 border-l border-gray-200" style="border-left-color:${esc(ac)}">
          <h3 class="text-[11pt] font-medium text-gray-900">${esc(proj.name)}</h3>
          ${proj.description ? `<div class="text-[11pt] text-gray-700 leading-snug mt-1 quill-content">${proj.description}</div>` : ''}
        </div>`).join('')}
      </div>
    </section>` : ''}

    <div class="grid grid-cols-2 gap-8">
      ${data.education?.length > 0 && sv.education ? `
      <section>
        <h2 class="text-[12pt] font-light mb-1 pb-1 border-b border-gray-200">Education</h2>
        <div class="space-y-1.5">
          ${data.education.map(edu => `
          <div class="education-item">
            <h3 class="text-[11pt] font-semibold text-gray-900">${esc(edu.degree)}${edu.field ? ` in ${esc(edu.field)}` : ''}</h3>
            <p class="text-[11pt]" style="color:${esc(ac)}">${esc(edu.institution)}</p>
            <div class="flex justify-between items-center text-[10pt] text-gray-600">
              <span>${esc(fmt(edu.graduation_date))}</span>
              ${edu.gpa ? `<span>GPA: ${esc(edu.gpa)}</span>` : ''}
            </div>
          </div>`).join('')}
        </div>
      </section>` : ''}

      ${data.skills?.length > 0 && sv.skills ? `
      <section>
        <h2 class="text-[12pt] font-light mb-1 pb-1 border-b border-gray-200">Skills</h2>
        <div class="flex flex-wrap gap-2">
          ${data.skills.map(s => `<span class="px-3 py-1 text-[11pt] text-white rounded-full" style="background-color:${esc(ac)}">${esc(s)}</span>`).join('')}
        </div>
      </section>` : ''}
    </div>

    ${data.certifications?.length > 0 && sv.certifications ? `
    <section class="mb-2 mt-2">
      <h2 class="text-[12pt] font-light mb-1 pb-1 border-b border-gray-200">Certifications</h2>
      <div class="space-y-1.5">
        ${data.certifications.map(cert => `
        <div class="relative pl-6 border-l border-gray-200">
          <h3 class="text-[11pt] font-medium text-gray-900">${esc(cert.name)}</h3>
          ${cert.issuer ? `<p class="text-[11pt] font-medium" style="color:${esc(ac)}">${esc(cert.issuer)}</p>` : ''}
          ${cert.date ? `<p class="text-[10pt] text-gray-500">${esc(fmt(cert.date))}</p>` : ''}
        </div>`).join('')}
      </div>
    </section>` : ''}

    ${data.achievements?.length > 0 && sv.achievements ? `
    <section class="mb-2">
      <h2 class="text-[12pt] font-light mb-1 pb-1 border-b border-gray-200">Achievements</h2>
      <ul class="space-y-1 list-disc pl-6">
        ${data.achievements.map(a => `<li class="text-[11pt] text-gray-700">${esc(ach(a))}</li>`).join('')}
      </ul>
    </section>` : ''}

    ${data.custom_sections?.length > 0 && sv.customSections
      ? data.custom_sections.filter(s => s.section_name && s.content).map(s => `
    <section class="mb-2">
      <h2 class="text-[12pt] font-light mb-1 pb-1 border-b border-gray-200">${esc(s.section_name)}</h2>
      <div class="text-[11pt] text-gray-700 leading-snug quill-content">${s.content}</div>
    </section>`).join('') : ''}
  </div>
</div>`)
}

// ── Minimal ───────────────────────────────────────────────────────────────────
function minimal(data, ac, sv) {
  const p = data.personal_info || {}
  return wrap(`
<div class="max-w-4xl mx-auto p-[0.3in] bg-white text-gray-900 font-light text-[11pt]">
  <header class="mb-1.5">
    <h1 class="text-[18pt] font-thin mb-2 tracking-wide">${esc(p.full_name || 'Your Name')}</h1>
    <div class="flex flex-wrap gap-4 text-[10pt] text-gray-600">
      ${p.email ? `<span>${esc(p.email)}</span>` : ''}
      ${p.phone ? `<span>${esc(p.phone)}</span>` : ''}
      ${p.location ? `<span>${esc(p.location)}</span>` : ''}
      ${p.linkedin ? `<span class="break-all">${esc(p.linkedin)}</span>` : ''}
      ${p.website ? `<span class="break-all">${esc(p.website)}</span>` : ''}
    </div>
  </header>

  ${data.professional_summary && sv.summary ? `
  <section class="mb-2">
    <div class="text-[11pt] text-gray-700 quill-content">${data.professional_summary}</div>
  </section>` : ''}

  ${data.experience?.length > 0 && sv.experience ? `
  <section class="mb-2">
    <h2 class="text-[12pt] uppercase tracking-widest mb-1 font-medium" style="color:${esc(ac)}">Experience</h2>
    <div class="space-y-1.5">
      ${data.experience.map(exp => `
      <div class="experience-item">
        <div class="flex justify-between items-baseline mb-1">
          <h3 class="text-[11pt] font-medium">${esc(exp.position)}</h3>
          <span class="text-[10pt] text-gray-500">${esc(fmt(exp.start_date))} - ${exp.is_current ? 'Present' : esc(fmt(exp.end_date))}</span>
        </div>
        <p class="text-[11pt] text-gray-600 mb-2">${esc(exp.company)}</p>
        ${exp.description ? `<div class="text-[11pt] text-gray-700 leading-snug quill-content">${exp.description}</div>` : ''}
      </div>`).join('')}
    </div>
  </section>` : ''}

  ${data.project?.length > 0 && sv.projects ? `
  <section class="mb-2">
    <h2 class="text-[12pt] uppercase tracking-widest mb-1 font-medium" style="color:${esc(ac)}">Projects</h2>
    <div class="space-y-1">
      ${data.project.map(proj => `
      <div class="project-item">
        <h3 class="text-[11pt] font-medium">${esc(proj.name)}</h3>
        ${proj.description ? `<div class="text-[11pt] text-gray-600 quill-content">${proj.description}</div>` : ''}
      </div>`).join('')}
    </div>
  </section>` : ''}

  ${data.education?.length > 0 && sv.education ? `
  <section class="mb-2">
    <h2 class="text-[12pt] uppercase tracking-widest mb-1 font-medium" style="color:${esc(ac)}">Education</h2>
    <div class="space-y-1.5">
      ${data.education.map(edu => `
      <div class="education-item flex justify-between items-baseline">
        <div>
          <h3 class="text-[11pt] font-medium">${esc(edu.degree)}${edu.field ? ` in ${esc(edu.field)}` : ''}</h3>
          <p class="text-[11pt] text-gray-600">${esc(edu.institution)}</p>
          ${edu.gpa ? `<p class="text-[11pt] text-gray-500">GPA: ${esc(edu.gpa)}</p>` : ''}
        </div>
        <span class="text-[10pt] text-gray-500">${esc(fmt(edu.graduation_date))}</span>
      </div>`).join('')}
    </div>
  </section>` : ''}

  ${data.skills?.length > 0 && sv.skills ? `
  <section class="mb-2">
    <h2 class="text-[12pt] uppercase tracking-widest mb-1 font-medium" style="color:${esc(ac)}">Skills</h2>
    <div class="text-[11pt] text-gray-700">${data.skills.map(s => esc(s)).join(' • ')}</div>
  </section>` : ''}

  ${data.certifications?.length > 0 && sv.certifications ? `
  <section class="mb-2">
    <h2 class="text-[12pt] uppercase tracking-widest mb-1 font-medium" style="color:${esc(ac)}">Certifications</h2>
    <div class="space-y-1.5">
      ${data.certifications.map(cert => `
      <div>
        <h3 class="text-[11pt] font-medium">${esc(cert.name)}</h3>
        ${cert.issuer ? `<p class="text-[11pt] text-gray-600">${esc(cert.issuer)}</p>` : ''}
        ${cert.date ? `<p class="text-[10pt] text-gray-500">${esc(fmt(cert.date))}</p>` : ''}
      </div>`).join('')}
    </div>
  </section>` : ''}

  ${data.achievements?.length > 0 && sv.achievements ? `
  <section class="mb-2">
    <h2 class="text-[12pt] uppercase tracking-widest mb-1 font-medium" style="color:${esc(ac)}">Achievements</h2>
    <ul class="space-y-1">
      ${data.achievements.map(a => `<li class="text-[11pt] text-gray-700">• ${esc(ach(a))}</li>`).join('')}
    </ul>
  </section>` : ''}

  ${data.custom_sections?.length > 0 && sv.customSections
    ? data.custom_sections.filter(s => s.section_name && s.content).map(s => `
  <section class="mb-2">
    <h2 class="text-[12pt] uppercase tracking-widest mb-1 font-medium" style="color:${esc(ac)}">${esc(s.section_name)}</h2>
    <div class="text-[11pt] text-gray-700 leading-snug quill-content">${s.content}</div>
  </section>`).join('') : ''}
</div>`)
}

// ── Minimal Image ─────────────────────────────────────────────────────────────
function minimalImage(data, ac, sv) {
  const p = data.personal_info || {}
  const imageUrl = typeof p.image === 'string' ? p.image : null
  return wrap(`
<div class="max-w-5xl mx-auto bg-white text-zinc-800 text-[11pt]">
  <div class="grid grid-cols-3">
    <div class="col-span-1 p-[0.3in]">
      ${imageUrl ? `<div class="mb-2"><img src="${esc(imageUrl)}" alt="Profile" class="w-28 h-28 object-cover rounded-full mx-auto" style="background:${esc(ac)}70"/></div>` : ''}
    </div>
    <div class="col-span-2 flex flex-col justify-center p-[0.3in] py-2">
      <h1 class="text-[18pt] font-bold text-zinc-700 tracking-widest">${esc(p.full_name || 'Your Name')}</h1>
      <p class="uppercase text-zinc-600 font-medium text-[10pt] tracking-widest">${esc(p.profession || '')}</p>
    </div>

    <aside class="col-span-1 border-r border-zinc-400 px-[0.3in] pb-3 pt-0">
      <section class="mb-2">
        <h2 class="text-[12pt] font-semibold tracking-widest text-zinc-600 mb-1">CONTACT</h2>
        <div class="space-y-1.5 text-[10pt]">
          ${p.phone ? `<div class="flex items-center gap-2" style="color:${esc(ac)}">${PHONE}<span class="text-zinc-800">${esc(p.phone)}</span></div>` : ''}
          ${p.email ? `<div class="flex items-center gap-2" style="color:${esc(ac)}">${MAIL}<span class="text-zinc-800">${esc(p.email)}</span></div>` : ''}
          ${p.location ? `<div class="flex items-center gap-2" style="color:${esc(ac)}">${MAPPIN}<span class="text-zinc-800">${esc(p.location)}</span></div>` : ''}
        </div>
      </section>

      ${data.education?.length > 0 && sv.education ? `
      <section class="mb-2">
        <h2 class="text-[12pt] font-semibold tracking-widest text-zinc-600 mb-1">EDUCATION</h2>
        <div class="space-y-1.5 text-[11pt]">
          ${data.education.map(edu => `
          <div class="education-item">
            <p class="font-semibold uppercase">${esc(edu.degree)}</p>
            <p class="text-zinc-600">${esc(edu.institution)}</p>
            <p class="text-[10pt] text-zinc-500">${esc(fmt(edu.graduation_date))}</p>
          </div>`).join('')}
        </div>
      </section>` : ''}

      ${data.skills?.length > 0 && sv.skills ? `
      <section>
        <h2 class="text-[12pt] font-semibold tracking-widest text-zinc-600 mb-1">SKILLS</h2>
        <ul class="space-y-1 text-[11pt]">
          ${data.skills.map(s => `<li>${esc(s)}</li>`).join('')}
        </ul>
      </section>` : ''}
    </aside>

    <main class="col-span-2 px-[0.3in] pb-4 pt-0">
      ${data.professional_summary && sv.summary ? `
      <section class="mb-2">
        <h2 class="text-[12pt] font-semibold tracking-widest mb-1" style="color:${esc(ac)}">SUMMARY</h2>
        <div class="text-[11pt] text-zinc-700 leading-snug quill-content">${data.professional_summary}</div>
      </section>` : ''}

      ${data.experience?.length > 0 && sv.experience ? `
      <section>
        <h2 class="text-[12pt] font-semibold tracking-widest mb-1" style="color:${esc(ac)}">EXPERIENCE</h2>
        <div class="space-y-1.5 mb-1.5">
          ${data.experience.map(exp => `
          <div class="experience-item">
            <div class="flex justify-between items-center">
              <h3 class="text-[11pt] font-semibold text-zinc-900">${esc(exp.position)}</h3>
              <span class="text-[10pt] text-zinc-500">${esc(fmt(exp.start_date))} - ${exp.is_current ? 'Present' : esc(fmt(exp.end_date))}</span>
            </div>
            <p class="text-[11pt] mb-2" style="color:${esc(ac)}">${esc(exp.company)}</p>
            ${exp.description ? `<div class="text-[11pt] text-zinc-700 leading-snug quill-content">${exp.description}</div>` : ''}
          </div>`).join('')}
        </div>
      </section>` : ''}

      ${data.project?.length > 0 && sv.projects ? `
      <section class="mb-2">
        <h2 class="text-[12pt] uppercase tracking-widest font-semibold" style="color:${esc(ac)}">PROJECTS</h2>
        <div class="space-y-1">
          ${data.project.map(proj => `
          <div class="project-item">
            <h3 class="text-[11pt] font-medium text-zinc-800">${esc(proj.name)}</h3>
            ${proj.type ? `<p class="text-[11pt]" style="color:${esc(ac)}">${esc(proj.type)}</p>` : ''}
            ${proj.description ? `<div class="text-[11pt] text-zinc-700 leading-snug quill-content">${proj.description}</div>` : ''}
          </div>`).join('')}
        </div>
      </section>` : ''}

      ${data.certifications?.length > 0 && sv.certifications ? `
      <section class="mb-2">
        <h2 class="text-[12pt] font-semibold tracking-widest mb-1" style="color:${esc(ac)}">CERTIFICATIONS</h2>
        <div class="space-y-1.5">
          ${data.certifications.map(cert => `
          <div>
            <h3 class="text-[11pt] font-semibold text-zinc-900">${esc(cert.name)}</h3>
            ${cert.issuer ? `<p class="text-[11pt]" style="color:${esc(ac)}">${esc(cert.issuer)}</p>` : ''}
            ${cert.date ? `<p class="text-[10pt] text-zinc-500">${esc(fmt(cert.date))}</p>` : ''}
          </div>`).join('')}
        </div>
      </section>` : ''}

      ${data.achievements?.length > 0 && sv.achievements ? `
      <section class="mb-2">
        <h2 class="text-[12pt] font-semibold tracking-widest mb-1" style="color:${esc(ac)}">ACHIEVEMENTS</h2>
        <ul class="space-y-1 list-disc pl-6">
          ${data.achievements.map(a => `<li class="text-[11pt] text-zinc-700">${esc(ach(a))}</li>`).join('')}
        </ul>
      </section>` : ''}

      ${data.custom_sections?.length > 0 && sv.customSections
        ? data.custom_sections.filter(s => s.section_name && s.content).map(s => `
      <section class="mb-2">
        <h2 class="text-[12pt] font-semibold tracking-widest mb-1" style="color:${esc(ac)}">${esc(s.section_name.toUpperCase())}</h2>
        <div class="text-[11pt] text-zinc-700 leading-snug quill-content">${s.content}</div>
      </section>`).join('') : ''}
    </main>
  </div>
</div>`)
}

// ── Compact ───────────────────────────────────────────────────────────────────
function compact(data, ac, sv) {
  const p = data.personal_info || {}
  return wrap(`
<div class="max-w-4xl mx-auto text-gray-800 text-[11pt]" style="background:linear-gradient(to right, ${esc(ac)}15 33.33%, white 33.33%)">
  <div class="grid grid-cols-3 gap-0">
    <div class="col-span-1 p-[0.3in]">
      <div class="mb-2">
        <h2 class="text-[12pt] font-bold uppercase tracking-wide mb-1" style="color:${esc(ac)}">Contact</h2>
        <div class="space-y-1.5 text-[10pt]">
          ${p.email ? `<div class="flex items-start gap-1.5" style="color:${esc(ac)}">${MAIL}<span class="break-all leading-tight text-gray-800">${esc(p.email)}</span></div>` : ''}
          ${p.phone ? `<div class="flex items-start gap-1.5" style="color:${esc(ac)}">${PHONE}<span class="leading-tight text-gray-800">${esc(p.phone)}</span></div>` : ''}
          ${p.location ? `<div class="flex items-start gap-1.5" style="color:${esc(ac)}">${MAPPIN}<span class="leading-tight text-gray-800">${esc(p.location)}</span></div>` : ''}
          ${p.linkedin ? `<div class="flex items-start gap-1.5" style="color:${esc(ac)}">${LINKEDIN}<span class="break-all leading-tight text-[10pt] text-gray-800">${esc((p.linkedin.split('https://www.')[1] || p.linkedin.split('https://')[1] || p.linkedin))}</span></div>` : ''}
          ${p.website ? `<div class="flex items-start gap-1.5" style="color:${esc(ac)}">${GLOBE}<span class="break-all leading-tight text-[10pt] text-gray-800">${esc((p.website.split('https://')[1] || p.website))}</span></div>` : ''}
        </div>
      </div>

      ${data.skills?.length > 0 && sv.skills ? `
      <div class="mb-2">
        <h2 class="text-[12pt] font-bold uppercase tracking-wide mb-1" style="color:${esc(ac)}">Skills</h2>
        <div class="flex flex-wrap gap-1">
          ${data.skills.map(s => `<span class="px-2 py-0.5 text-[11pt] rounded text-white" style="background-color:${esc(ac)}">${esc(s)}</span>`).join('')}
        </div>
      </div>` : ''}

      ${data.education?.length > 0 && sv.education ? `
      <div class="mb-2">
        <h2 class="text-[12pt] font-bold uppercase tracking-wide mb-1" style="color:${esc(ac)}">Education</h2>
        <div class="space-y-1.5">
          ${data.education.map(edu => `
          <div class="education-item">
            <h3 class="text-[11pt] font-semibold leading-tight">${esc(edu.degree)}</h3>
            ${edu.field ? `<p class="text-[11pt] text-gray-600 leading-tight">${esc(edu.field)}</p>` : ''}
            <p class="text-[11pt] text-gray-600 leading-tight">${esc(edu.institution)}</p>
            <div class="flex justify-between items-center text-[10pt] text-gray-500 mt-0.5">
              <span>${esc(fmt(edu.graduation_date))}</span>
              ${edu.gpa ? `<span>GPA: ${esc(edu.gpa)}</span>` : ''}
            </div>
          </div>`).join('')}
        </div>
      </div>` : ''}

      ${data.certifications?.length > 0 && sv.certifications ? `
      <div class="mb-2">
        <h2 class="text-[12pt] font-bold uppercase tracking-wide mb-1" style="color:${esc(ac)}">Certifications</h2>
        <div class="space-y-1.5">
          ${data.certifications.map(cert => `
          <div>
            <h3 class="text-[11pt] font-semibold leading-tight">${esc(cert.name)}</h3>
            ${cert.issuer ? `<p class="text-[11pt] text-gray-600 leading-tight">${esc(cert.issuer)}</p>` : ''}
            ${cert.date ? `<p class="text-[10pt] text-gray-500 leading-tight">${esc(fmt(cert.date))}</p>` : ''}
          </div>`).join('')}
        </div>
      </div>` : ''}
    </div>

    <div class="col-span-2 p-[0.3in]">
      <header class="mb-2">
        <h1 class="text-[18pt] font-bold mb-1" style="color:${esc(ac)}">${esc(p.full_name || 'Your Name')}</h1>
      </header>

      ${data.professional_summary && sv.summary ? `
      <section class="mb-2.5">
        <div class="text-[11pt] text-gray-700 leading-snug quill-content">${data.professional_summary}</div>
      </section>` : ''}

      ${data.experience?.length > 0 && sv.experience ? `
      <section class="mb-2.5">
        <h2 class="text-[12pt] font-bold uppercase tracking-wide mb-1 pb-1 border-b-2" style="color:${esc(ac)};border-color:${esc(ac)}">Experience</h2>
        <div class="space-y-1.5">
          ${data.experience.map(exp => `
          <div class="experience-item">
            <div class="flex justify-between items-baseline mb-0.5">
              <h3 class="text-[11pt] font-semibold text-gray-900">${esc(exp.position)}</h3>
              <div class="text-[10pt] text-gray-500">${esc(fmt(exp.start_date))} - ${exp.is_current ? 'Present' : esc(fmt(exp.end_date))}</div>
            </div>
            <p class="text-[11pt] font-medium mb-1" style="color:${esc(ac)}">${esc(exp.company)}</p>
            ${exp.description ? `<div class="text-[11pt] text-gray-700 leading-snug quill-content">${exp.description}</div>` : ''}
          </div>`).join('')}
        </div>
      </section>` : ''}

      ${data.project?.length > 0 && sv.projects ? `
      <section class="mb-2.5">
        <h2 class="text-[12pt] font-bold uppercase tracking-wide mb-1 pb-1 border-b-2" style="color:${esc(ac)};border-color:${esc(ac)}">Projects</h2>
        <div class="space-y-1">
          ${data.project.map(proj => `
          <div class="project-item">
            <h3 class="text-[11pt] font-semibold text-gray-900 mb-0.5">${esc(proj.name)}</h3>
            ${proj.description ? `<div class="text-[11pt] text-gray-700 leading-snug quill-content">${proj.description}</div>` : ''}
          </div>`).join('')}
        </div>
      </section>` : ''}

      ${data.achievements?.length > 0 && sv.achievements ? `
      <section class="mb-2.5">
        <h2 class="text-[12pt] font-bold uppercase tracking-wide mb-1 pb-1 border-b-2" style="color:${esc(ac)};border-color:${esc(ac)}">Achievements</h2>
        <ul class="space-y-0.5 list-disc pl-4">
          ${data.achievements.map(a => `<li class="text-[11pt] text-gray-700 leading-snug">${esc(ach(a))}</li>`).join('')}
        </ul>
      </section>` : ''}

      ${data.custom_sections?.length > 0 && sv.customSections
        ? data.custom_sections.filter(s => s.section_name && s.content).map(s => `
      <section class="mb-2.5">
        <h2 class="text-[12pt] font-bold uppercase tracking-wide mb-1 pb-1 border-b-2" style="color:${esc(ac)};border-color:${esc(ac)}">${esc(s.section_name)}</h2>
        <div class="text-[11pt] text-gray-700 leading-snug quill-content">${s.content}</div>
      </section>`).join('') : ''}
    </div>
  </div>
</div>`)
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function generateResumeHTML(data) {
  if (!data) return wrap('<div></div>')

  const ac = data.accent_color || '#000000'
  const sv = {
    summary: true,
    experience: true,
    education: true,
    projects: true,
    skills: true,
    certifications: true,
    achievements: true,
    customSections: true,
    ...(data.sectionVisibility || {}),
  }

  switch (data.template) {
    case 'modern':        return modern(data, ac, sv)
    case 'minimal':       return minimal(data, ac, sv)
    case 'minimal-image': return minimalImage(data, ac, sv)
    case 'compact':       return compact(data, ac, sv)
    default:              return classic(data, ac, sv)
  }
}
