const fs = require('fs');
const path = require('path');

// Remove ALL emojis from all planet files
const files = [
    'mercury.html',
    'venus.html',
    'mars.html',
    'jupiter.html',
    'earth.html',
    'saturn.html',
    'src/earth-app.js',
    'src/mercury-dashboard.js',
    'src/venus-app.js',
    'src/mars-app.js',
    'src/jupiter-app.js',
    'src/saturn-app.js'
];

const emojiReplacements = {
    '🔬': '',
    '💪': '',
    '🔥': '',
    '⚡': '',
    '🌙': '',
    '❤️': '',
    '🧠': '',
    '📊': '',
    '🔄': '',
    '⌚': '',
    '🔒': '',
    '⚠️': '',
    '🎯': '',
    '💰': '',
    '🏦': '',
    '📅': '',
    '🌍': '',
    '💀': '',
    '⏳': '',
    '🎉': '',
    '✅': '',
    '❌': '',
    '🚀': '',
    '💡': '',
    '🌟': '',
    '📈': '',
    '📉': '',
    '🎨': '',
    '🔔': '',
    '👤': '',
    '👥': '',
    '💬': '',
    '📝': '',
    '🗂️': '',
    '📁': '',
    '🔍': '',
    '⚙️': '',
    '🛠️': '',
    '🎮': '',
    '🏆': '',
    '🥇': '',
    '🥈': '',
    '🥉': '',
    '💯': ''
};

let totalRemoved = 0;

files.forEach(file => {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${file} not found, skipping...`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let removed = 0;

    Object.keys(emojiReplacements).forEach(emoji => {
        const count = (content.match(new RegExp(emoji, 'g')) || []).length;
        if (count > 0) {
            content = content.replace(new RegExp(emoji, 'g'), emojiReplacements[emoji]);
            removed += count;
        }
    });

    if (removed > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ ${file}: Removed ${removed} emojis`);
        totalRemoved += removed;
    } else {
        console.log(`  ${file}: No emojis found`);
    }
});

console.log(`\n🎯 Total emojis removed: ${totalRemoved}`);
console.log('✅ All emojis removed from planet files');
