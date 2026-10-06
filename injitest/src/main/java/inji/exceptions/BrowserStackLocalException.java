package inji.exceptions;

public class BrowserStackLocalException extends RuntimeException {

  public BrowserStackLocalException(String message) {
    super(message);
  }

  public BrowserStackLocalException(String message, Throwable cause) {
    super(message, cause);
  }
}
