import requests
import json

url = 'https://iyzhwnvpqohdjqnrvqjq.supabase.co/rest/v1'
key = 'sb_publishable_qhofcnT-u4Xbwv2QY1FjaA_vrdNOe_v'
headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

r = requests.get(f'{url}/schedules?select=*', headers=headers)
r.encoding = 'utf-8'
schedules = r.json()
print(f'Total schedules: {len(schedules)}')
for s in schedules:
    print(f"ID: {s.get('id')}, Student: {s.get('student_name')}, Day: {s.get('day_of_week')}, Date: {s.get('date')}, Time: {s.get('start_time')}-{s.get('end_time')}, Teacher: {s.get('teacher_name')}, Room: {s.get('room')}")

r = requests.get(f'{url}/teachers?select=*', headers=headers)
r.encoding = 'utf-8'
teachers = r.json()
print(f'\nTotal teachers: {len(teachers)}')
for t in teachers:
    print(f"Teacher ID: {t.get('id')}, Name: {t.get('name')}, Nickname: {t.get('nickname')}, Instrument: {t.get('instrument')}")

r = requests.get(f'{url}/students?select=*', headers=headers)
r.encoding = 'utf-8'
students = r.json()
print(f'\nTotal students: {len(students)}')
for st in students:
    if '劉' in str(st.get('name', '')) or 'Lin' in str(st.get('name', '')) or '55555555' in str(st.get('id', '')):
        print(f"Match: {st}")
