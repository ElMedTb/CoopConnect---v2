package com.coopconnect.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * JWT authentication entry point for handling unauthorized requests.
 * Returns consistent JSON error responses for authentication failures.
 * 
 * @author CoopConnect Team
 * @version 1.0.0
 */
@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, 
                        HttpServletResponse response,
                        AuthenticationException authException) throws IOException, ServletException {
        
        log.error("Responding with unauthorized error. Message: {}", authException.getMessage());
        
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        ObjectMapper mapper = new ObjectMapper();
        response.getWriter().write(mapper.writeValueAsString(
            new ErrorResponse("Unauthorized", 
                          "You are not authorized to access this resource",
                          HttpServletResponse.SC_UNAUTHORIZED)
        ));
    }

    private record ErrorResponse(String error, String message, int status) {}
}
