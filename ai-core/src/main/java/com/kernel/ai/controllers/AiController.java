package com.kernel.ai.controllers;

import com.kernel.ai.services.AiService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiService ai;

    public AiController(AiService ai) {
        this.ai = ai;
    }

    @PostMapping("/ask")
    public Answer ask(@RequestBody Question q) {
        String answer = ai.generateAnswer(q.question);
        return new Answer(answer);
    }

    static class Question {
        public String question;
    }

    static class Answer {
        public String answer;
        public Answer(String answer) {
            this.answer = answer;
        }
    }
}
