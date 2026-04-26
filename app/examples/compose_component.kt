package com.example.tasks

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

data class Task(
    val id: String,
    val title: String,
    val description: String,
    val done: Boolean
)

@Composable
fun TaskCard(task: Task, onTaskChanged: (Task) -> Unit) {
    val checked = remember { mutableStateOf(task.done) }
    val title = remember { mutableStateOf(task.title) }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Row {
            Checkbox(
                checked = checked.value,
                onCheckedChange = {
                    checked.value = it
                    onTaskChanged(task.copy(done = checked.value))
                }
            )

            Spacer(modifier = Modifier.width(8.dp))

            Column {
                Text(text = title.value)
                Text(text = task.description)
            }
        }

        Button(
            onClick = {
                title.value = title.value.trim()
                onTaskChanged(task.copy(title = title.value, done = checked.value))
            }
        ) {
            Text("Save")
        }
    }
}
