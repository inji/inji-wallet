package inji.exceptions;

public class DriverInitializationException extends RuntimeException {

  public DriverInitializationException(String message) {
    super(message);
  }

  public DriverInitializationException(String message, Throwable cause) {
    super(message, cause);
  }
}
