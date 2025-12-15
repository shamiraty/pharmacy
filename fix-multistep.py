#!/usr/bin/env python3
import re

# Read the file
with open('app/dashboard/medicines/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Read the multistep content
with open('multistep-content.txt', 'r', encoding='utf-8') as f:
    multistep_content = f.read()

# Find the start of form content (after <form onSubmit={handleSubmit} className="p-6">)
form_start_pattern = r'<form onSubmit=\{handleSubmit\} className="p-6">'
form_start_match = re.search(form_start_pattern, content)

if not form_start_match:
    print("Could not find form start")
    exit(1)

form_start_pos = form_start_match.end()

# Find the end of form (the closing </form> tag before View Medicine Modal)
# We need to find the correct closing form tag
view_modal_pattern = r'\{/\* View Medicine Modal \*/\}'
view_modal_match = re.search(view_modal_pattern, content)

if not view_modal_match:
    print("Could not find View Medicine Modal comment")
    exit(1)

# Search backward from View Medicine Modal to find the form closing
before_view = content[:view_modal_match.start()]
form_end_pattern = r'</form>\s*</div>\s*</div>\s*\)\}\s*$'
form_end_matches = list(re.finditer(form_end_pattern, before_view))

if not form_end_matches:
    print("Could not find form end")
    exit(1)

# Get the last match (closest to View Modal)
form_end_match = form_end_matches[-1]
# We want to keep </form> but replace everything between <form> and </form>
form_content_start = form_start_pos
form_content_end = form_end_match.start()  # Position just before </form>

# Build the new content
new_content = (
    content[:form_content_start] +
    "\n" + multistep_content + "\n            " +
    content[form_content_end:]
)

# Write the new content
with open('app/dashboard/medicines/page.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully updated the file!")
print(f"Replaced content from position {form_content_start} to {form_content_end}")
