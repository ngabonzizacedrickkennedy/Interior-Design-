package com.spacedesigngroup.core.common.exception;

public class AiAssessmentFailedException extends RuntimeException {

    public AiAssessmentFailedException(String message) {
        super(message);
    }

    public AiAssessmentFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
