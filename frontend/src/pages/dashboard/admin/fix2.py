file_path = r'E:\NIC\laravelreact\frontend\src\pages\dashboard\admin\UserManagement.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

header_lines = [
    '\t\t\t\t\t\t<header className="admin-user-modal__header">\n',
    '\t\t\t\t\t\t\t<h3>Create staff user</h3>\n',
    '\t\t\t\t\t\t\t<button type="button" className="admin-user-modal__close" onClick={() => setShowAddForm(false)}>\n'
]
lines[365:420] = header_lines

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("Replaced lines 366-420 with modal header.")
