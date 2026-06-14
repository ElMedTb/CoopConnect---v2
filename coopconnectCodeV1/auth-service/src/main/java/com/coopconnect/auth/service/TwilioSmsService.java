package com.coopconnect.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class TwilioSmsService {

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.from-number:}")
    private String fromNumber;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean sendVerificationCode(String toNumber, String code) {
        if (isBlank(accountSid) || isBlank(authToken) || isBlank(fromNumber)) {
            log.warn("Twilio is not configured. SMS verification code for {} is {}", toNumber, code);
            return false;
        }

        String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.set(HttpHeaders.AUTHORIZATION, "Basic " + basicAuth());

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("To", toNumber);
        form.add("From", fromNumber);
        form.add("Body", "Votre code CoopConnect est: " + code);

        restTemplate.postForEntity(url, new HttpEntity<>(form, headers), String.class);
        return true;
    }

    private String basicAuth() {
        String value = accountSid + ":" + authToken;
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
