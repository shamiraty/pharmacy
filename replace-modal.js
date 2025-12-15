const fs = require('fs');

const filePath = './app/dashboard/medicines/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// Find the line numbers
const startLine = 673; // 0-indexed, so 674 - 1
const endLine = 1068; // 0-indexed, so 1069 - 1

// New content to replace
const newModalContent = `
      {/* Add Medicine Modal - Multistep */}
      <MedicineFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        categories={categories}
        submitting={submitting}
        mode="add"
      />
`;

// Replace the lines
const newLines = [
  ...lines.slice(0, startLine),
  newModalContent,
  ...lines.slice(endLine + 1)
];

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Modal replaced successfully!');
