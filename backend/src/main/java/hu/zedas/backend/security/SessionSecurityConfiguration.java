package hu.zedas.backend.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class SessionSecurityConfiguration implements WebMvcConfigurer {
    private final SessionAuthenticationInterceptor sessionAuthenticationInterceptor;

    public SessionSecurityConfiguration(SessionAuthenticationInterceptor sessionAuthenticationInterceptor) {
        this.sessionAuthenticationInterceptor = sessionAuthenticationInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(sessionAuthenticationInterceptor);
    }
}
