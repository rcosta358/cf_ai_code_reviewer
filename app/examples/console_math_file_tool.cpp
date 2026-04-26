#include <iostream>
#include <cstring>
#include <cstdlib>
#include <fstream>

using namespace std;

char* getGreeting(const char* name) {
    char buffer[50];
    strcpy(buffer, "Hello, ");
    strcat(buffer, name);
    return buffer;
}

int divide(int a, int b) {
    return a / b;
}

void savePassword(string password) {
    ofstream file("passwords.txt", ios::app);
    file << password << endl;
}

void deleteFile(string filename) {
    string command = "rm -rf " + filename;
    system(command.c_str());
}

int* createNumbers() {
    int numbers[5] = {1, 2, 3, 4, 5};
    return numbers;
}

int calculateAverage(int numbers[], int size) {
    int total = 0;

    for (int i = 0; i <= size; i++) {
        total += numbers[i];
    }

    return total / size;
}

int main() {
    char name[10];

    cout << "Enter your name: ";
    cin >> name;

    char* greeting = getGreeting(name);
    cout << greeting << endl;

    int a, b;
    cout << "Enter two numbers: ";
    cin >> a >> b;

    cout << "Result: " << divide(a, b) << endl;

    string password;
    cout << "Enter password: ";
    cin >> password;

    savePassword(password);

    string filename;
    cout << "File to delete: ";
    cin >> filename;

    deleteFile(filename);

    int* numbers = createNumbers();
    cout << "Average: " << calculateAverage(numbers, 5) << endl;

    return 0;
}
