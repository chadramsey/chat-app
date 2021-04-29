package com.bytefox.chat.demo

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class InfoController {

    @Autowired
    lateinit var messageController: MessageController

    @GetMapping("/hint")
    fun getHint(): String {
        return "Your hint is ${messageController.secretCode.randomLetter()}"
    }

    @GetMapping("/winner")
    fun getWinner(): String {
        if (messageController.winnerFound) {
            return "The winner is ${messageController.winner}"
        } else {
            return "No winner has been found, keep trying!"
        }
    }
}