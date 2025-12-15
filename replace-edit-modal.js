const fs = require('fs');

const filePath = './app/dashboard/medicines/page.tsx';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// Find the line numbers for Edit modal
const startLine = 815; // 0-indexed, so 816 - 1
const endLine = 996; // 0-indexed, so 997 - 1

// New content to replace
const newModalContent = `
      {/* Edit Medicine Modal - Multistep */}
      <MedicineFormModal
        isOpen={showEditModal && selectedMedicine !== null}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMedicine(null);
          resetForm();
        }}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleUpdate}
        categories={categories}
        submitting={submitting}
        mode="edit"
      />
`;

// Replace the lines
const newLines = [
  ...lines.slice(0, startLine),
  newModalContent,
  ...lines.slice(endLine + 1)
];

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Edit modal replaced successfully!');
