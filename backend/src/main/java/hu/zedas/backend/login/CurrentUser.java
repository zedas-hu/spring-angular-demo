package hu.zedas.backend.login;

import java.io.Serial;
import java.io.Serializable;

/**
 * Session storage for the currently logged-in user
 */
public record CurrentUser(
        Integer employeeId,
        String firstName,
        String lastName,
        String email) implements Serializable {
    public static final String SESSION_ATTRIBUTE = "currentUser";

    @Serial
    private static final long serialVersionUID = 1L;
}
