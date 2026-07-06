import re
file_path = r'E:\NIC\laravelreact\frontend\src\pages\dashboard\admin\UserManagement.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'(<div className="auth-card admin-user-modal">\s*)<h3>Create staff user</h3>.*?<select[^>]*>\s*×', re.DOTALL)

def replacer(match):
    prefix = match.group(1)
    return prefix + '''<header className="admin-user-modal__header">
\t\t\t\t\t\t\t<h3>Create staff user</h3>
\t\t\t\t\t\t\t<button type="button" className="admin-user-modal__close" onClick={() => setShowAddForm(false)}>
\t\t\t\t\t\t\t\t×'''

new_content, count = pattern.subn(replacer, content)

if count > 0:
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Replaced {count} occurrence(s).')
else:
    print('Pattern not found.')
