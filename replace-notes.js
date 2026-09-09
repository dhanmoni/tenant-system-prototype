const fs = require('fs');
const path = require('path');

const files = [
    'frontend/src/components/FormIARentRevisionPanel.jsx',
    'frontend/src/components/Form8RentTribunalAppealPanel.jsx',
    'frontend/src/components/Form7RentCourtAppealPanel.jsx',
    'frontend/src/components/Form6RentAuthorityFilingPanel.jsx',
    'frontend/src/components/Form5RentCourtFilingPanel.jsx',
    'frontend/src/components/Form4RentCourtPossessionPanel.jsx'
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Add Info import if not exists
    if (!content.includes('import { Info }')) {
        content = content.replace(/import {([^}]+)} from 'lucide-react'/, (match, p1) => {
            return `import {${p1}, Info} from 'lucide-react'`;
        });
        if (!content.includes('import { Info }') && !content.includes('Info,')) {
            content = content.replace(/import api, { csrf } from '\.\.\/api'/, "import { Info } from 'lucide-react'\nimport api, { csrf } from '../api'");
        }
    }

    // 1. matter-choice integration
    content = content.replace(
        /<span className="matter-choice__cite">\{([^\}]+)\.citation\}<\/span>\s*<span className="matter-choice__label">\{([^\}]+)\.(heading|label)\}<\/span>/g,
        `<span className="matter-choice__cite" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
\t\t\t\t\t\t\t\t\t\t{$1.citation}
\t\t\t\t\t\t\t\t\t\t<div className="ground-choice__info-container">
\t\t\t\t\t\t\t\t\t\t\t<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
\t\t\t\t\t\t\t\t\t\t\t<div className="ground-choice__info-popup">
\t\t\t\t\t\t\t\t\t\t\t\t<strong>{$1.citation}</strong>
\t\t\t\t\t\t\t\t\t\t\t\t<p style={{ marginTop: '0.25rem', marginBottom: 0 }}>{$1.note}</p>
\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t</span>
\t\t\t\t\t\t\t\t\t<span className="matter-choice__label">{$2.$3}</span>`
    );

    // 2. Remove matter-choice-detail
    content = content.replace(/\{selectedMatter \? \([\s\S]*?\) : null\}/, '');
    content = content.replace(/\{selectedBasis \? \([\s\S]*?\) : null\}/, '');

    // 3. Label text + field-note conversion
    content = content.replace(
        /<p className="(label-text[^"]*)">([^<]+)<\/p>\s*<p className="field-note">\s*([\s\S]*?)\s*<\/p>/g,
        `<p className="$1" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
\t\t\t\t\t\t\t\t$2
\t\t\t\t\t\t\t\t<div className="ground-choice__info-container">
\t\t\t\t\t\t\t\t\t<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
\t\t\t\t\t\t\t\t\t<div className="ground-choice__info-popup">
\t\t\t\t\t\t\t\t\t\t<span>$3</span>
\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t</p>`
    );

    // Also for <span> instead of <p>
    content = content.replace(
        /<span className="(label-text[^"]*)">([^<]+)<\/span>\s*<span className="field-note">([\s\S]*?)<\/span>/g,
        `<span className="$1" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
\t\t\t\t\t\t\t$2
\t\t\t\t\t\t\t<div className="ground-choice__info-container">
\t\t\t\t\t\t\t\t<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
\t\t\t\t\t\t\t\t<div className="ground-choice__info-popup">
\t\t\t\t\t\t\t\t\t<span>$3</span>
\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t</span>`
    );

    // 4. matter-check integration
    // We target exactly the span wrapper block
    content = content.replace(
        /<span>\s*<span className="matter-check__cite">\{([^\}]+)\.citation\}<\/span>\s*<span className="matter-check__text">\{([^\}]+)\.(text|title)\}<\/span>([\s\S]*?)<\/span>/g,
        (match, v1, v2, v3, inner) => {
            // For Form 6 repair items, they have {item.title}. For Form 4 eviction grounds, they have {clause.text}.
            let explanationPart = '';
            if (inner.includes('explanation')) {
                 explanationPart = `{${v1}.explanation && <p style={{ marginTop: 0, fontStyle: 'italic' }}>{${v1}.explanation}</p>}`;
            }

            // The label to display inline. For EVICTION_GROUND_CLAUSES we added `label`, for others it might be `title`.
            // Wait, for Form 6, REPAIR_PARTS item has `code`, `title`. It has no `label` or `text`. So inline text is `title`.
            let inlineText = v3 === 'title' ? `{${v1}.title}` : `{${v1}.label}`;
            let popupText = v3 === 'title' ? '' : `<p style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>{${v2}.text}</p>`;

            return `<span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
\t\t\t\t\t\t\t\t\t\t\t<span className="matter-check__cite" style={{ marginBottom: 0 }}>${inlineText}</span>
\t\t\t\t\t\t\t\t\t\t\t<div className="ground-choice__info-container">
\t\t\t\t\t\t\t\t\t\t\t\t<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
\t\t\t\t\t\t\t\t\t\t\t\t<div className="ground-choice__info-popup">
\t\t\t\t\t\t\t\t\t\t\t\t\t<strong>{${v1}.citation}</strong>
\t\t\t\t\t\t\t\t\t\t\t\t\t${popupText}
\t\t\t\t\t\t\t\t\t\t\t\t\t${explanationPart}
\t\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t\t\t\t</span>`;
        }
    );

    // Special fix for PriorProceedingsField: we already updated it manually! 
    // Wait, the "theirs" checkout didn't touch PriorProceedingsField because I didn't checkout forms/*.jsx.
    // So PriorProceedingsField is fully intact.

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
});
