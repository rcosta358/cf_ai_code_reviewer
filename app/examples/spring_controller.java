package com.example.orders;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
public class OrderController {
    private final List<Order> orders = new ArrayList<>();

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable String id) {
        for (Order order : orders) {
            if (order.id().equals(id)) {
                return ResponseEntity.ok(order);
            }
        }

        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        BigDecimal total = BigDecimal.ZERO;

        for (OrderLine line : request.lines()) {
            total = total.add(line.price().multiply(new BigDecimal(line.quantity())));
        }

        if (request.customerName().isBlank()) {
            throw new IllegalArgumentException("customer name is required");
        }

        Order order = new Order("order-" + (orders.size() + 1), request.customerName(), total);
        orders.add(order);

        return ResponseEntity.ok(order);
    }
}

record Order(String id, String customerName, BigDecimal total) {}

record OrderRequest(String customerName, List<OrderLine> lines) {}

record OrderLine(String sku, BigDecimal price, int quantity) {}
