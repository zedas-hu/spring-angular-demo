package hu.zedas.backend.login;

public record CurrentUserResponse(
        Integer employeeId,
        String firstName,
        String lastName,
        String email) {
    public static CurrentUserResponse empty() {
        return new CurrentUserResponse(null, null, null, null);
    }
}
