package com.project.authservice.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping("/index")
    public String Index(){
        return "Hello World";
    }

    @GetMapping("/dashboard")
    public String Dashboard(){
        return "Dashboard";
    }
}
