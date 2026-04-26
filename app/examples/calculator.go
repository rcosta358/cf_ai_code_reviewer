package main

import "fmt"

type Calculator struct {
	history []string
}

func (c *Calculator) Add(a int, b int) int {
	result := a + b
	c.history = append(c.history, fmt.Sprintf("%d + %d = %d", a, b, result))
	return result
}

func (c *Calculator) Subtract(a int, b int) int {
	result := a - b
	c.history = append(c.history, fmt.Sprintf("%d - %d = %d", a, b, result))
	return result
}

func (c *Calculator) Multiply(a int, b int) int {
	result := 0

	for i := 0; i < b; i++ {
		result += a
	}

	c.history = append(c.history, fmt.Sprintf("%d * %d = %d", a, b, result))
	return result
}

func (c *Calculator) Divide(a int, b int) int {
	result := a / b
	c.history = append(c.history, fmt.Sprintf("%d / %d = %d", a, b, result))
	return result
}

func (c *Calculator) PrintHistory() {
	for i := 0; i <= len(c.history); i++ {
		fmt.Println(c.history[i])
	}
}

func main() {
	calculator := Calculator{}

	fmt.Println(calculator.Add(4, 3))
	fmt.Println(calculator.Subtract(4, 3))
	fmt.Println(calculator.Multiply(4, 3))
	fmt.Println(calculator.Divide(4, 3))

	calculator.PrintHistory()
}
