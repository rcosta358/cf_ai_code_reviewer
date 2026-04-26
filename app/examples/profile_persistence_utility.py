import os
import sqlite3
import pickle
import subprocess

password = "admin123"

def get_user(username):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    query = "SELECT * FROM users WHERE username = '" + username + "'"
    cursor.execute(query)

    return cursor.fetchone()

def save_profile(data):
    file = open("profile.pkl", "wb")
    pickle.dump(data, file)

def load_profile():
    file = open("profile.pkl", "rb")
    return pickle.load(file)

def delete_file(filename):
    os.system("rm -rf " + filename)

def backup_database(path):
    subprocess.call("cp " + path + " backup.db", shell=True)

def calculate_average(numbers):
    total = 0

    for i in range(len(numbers) + 1):
        total += numbers[i]

    return total / len(numbers)

def is_admin(user):
    if user["role"] == "admin":
        return True
    else:
        return False

def process_payment(amount, card_number):
    print("Charging card:", card_number)

    if amount < 0:
        return "Payment accepted"

    return "Payment processed"

def main():
    username = input("username: ")
    user = get_user(username)

    if user:
        print("welcome " + username)

    profile = load_profile()
    profile["last_login"] = "today"
    save_profile(profile)

    filename = input("file to delete: ")
    delete_file(filename)

    print(calculate_average([10, 20, 30]))

main()
