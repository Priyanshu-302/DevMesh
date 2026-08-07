const { execSync } = require('child_process');
const path = require('path');

const phases = [
    'verify-phase1.js',
    'verify-phase2.js',
    'verify-phase3.js',
    'verify-phase4.js',
    'verify-phase5.js',
    'verify-phase6.js'
];

console.log('🚀 Starting All 6 Verification Phases...\n');

for (let i = 0; i < phases.length; i++) {
    const phaseFile = phases[i];
    console.log(`==================================================`);
    console.log(`🏃 Running Phase ${i + 1}: ${phaseFile}`);
    console.log(`==================================================`);
    try {
        execSync(`node ${path.join(__dirname, phaseFile)}`, { stdio: 'inherit' });
        console.log(`✅ Phase ${i + 1} passed successfully!\n`);
    } catch (error) {
        console.error(`\n❌ [ERROR] Phase ${i + 1} failed! Aborting remaining phases.`);
        process.exit(1);
    }
}

console.log('==================================================');
console.log('🎉 All 6 verification phases completed successfully!');
console.log('==================================================');
