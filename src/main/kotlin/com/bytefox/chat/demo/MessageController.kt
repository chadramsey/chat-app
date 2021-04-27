package com.bytefox.chat.demo

import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.stereotype.Controller
import org.springframework.web.util.HtmlUtils

@Controller
class MessageController {
    private final val secretCode = listOf("One", "Two", "Three").random()

    private var currentUsers = ArrayList<String>()

    @MessageMapping("/inbound")
    @SendTo("/topic/chat")
    fun sendMessage(inboundMessage: InboundMessage): OutboundMessage {
        if (inboundMessage.message.isEmpty()) {
            if (inboundMessage.connected) {
                return OutboundMessage("${inboundMessage.name} connected. Now it's a party!")
            }
            if (!inboundMessage.connected) {
                return OutboundMessage("${inboundMessage.name} disconnected. Boo.")
            }
        }
        if (inboundMessage.message == secretCode) {
            return OutboundMessage("${HtmlUtils.htmlEscape(inboundMessage.name)} :" +
                    " ${HtmlUtils.htmlEscape(inboundMessage.message)} - [You guessed the secret!]")
        }
        return OutboundMessage("${HtmlUtils.htmlEscape(inboundMessage.name)} " +
                ": ${HtmlUtils.htmlEscape(inboundMessage.message)} - [This is not the secret]")
    }

    @MessageMapping("/users/connect")
    @SendTo("/topic/currentUsers")
    fun updateUsers(inboundUser: InboundUser): OutboundUsers {
        currentUsers.add(inboundUser.name)
        return OutboundUsers(currentUsers)
    }

    @MessageMapping("/users/disconnect")
    @SendTo("/topic/currentUsers")
    fun removeDisconnectedUser(inboundUser: InboundUser): OutboundUsers {
        currentUsers.remove(inboundUser.name)
        return OutboundUsers(currentUsers)
    }
}