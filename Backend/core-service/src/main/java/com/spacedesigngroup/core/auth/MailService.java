package com.spacedesigngroup.core.auth;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private static final String INK = "#21170f";
    private static final String BG = "#faf5f2";
    private static final String BG_ALT = "#f0e8e1";
    private static final String ACCENT = "#c2790f";
    private static final String MUTED = "#6b5d51";
    private static final String LINE = "#e3d5c8";
    private static final String FONT_DISPLAY = "'Georgia', 'Times New Roman', serif";
    private static final String FONT_BODY = "'Helvetica Neue', Arial, sans-serif";

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.contact-notification-email:${spring.mail.username}}")
    private String contactNotificationEmail;

    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        String content =
                paragraph("Hi " + escape(fullName) + ",") +
                paragraph("Use the verification code below to finish signing in to your Space Design Group account. It expires in 10 minutes.") +
                otpBox(otp) +
                mutedParagraph("If you did not request this code, you can safely ignore this email.");
        send(toEmail, "Your verification code", wrap("Verify your email", content));
    }

    public void sendManagerWelcomeEmail(String toEmail, String fullName, String password) {
        String loginLink = frontendUrl + "/portal/login";
        String content =
                paragraph("Hi " + escape(fullName) + ",") +
                paragraph("An administrator has created a Project Manager account for you on Space Design Group. Your credentials are below.") +
                credentialsCard(toEmail, password) +
                paragraph("Please sign in and change your password as soon as possible.") +
                ctaButton("Sign in to the portal", loginLink);
        send(toEmail, "Your Space Design Group manager account", wrap("Welcome aboard", content));
    }

    public void sendNotificationEmail(String toEmail, String fullName, String messageBody) {
        String content =
                paragraph("Hi " + escape(fullName) + ",") +
                paragraph(escape(messageBody).replace("\n", "<br>"));
        send(toEmail, "Space Design Group notification", wrap("Notification", content));
    }

    public void sendPasswordResetEmail(String toEmail, String fullName, String token) {
        String resetLink = frontendUrl + "/portal/reset-password?token=" + token;
        String content =
                paragraph("Hi " + escape(fullName) + ",") +
                paragraph("We received a request to reset your password. Click the button below to choose a new one. This link expires in 30 minutes.") +
                ctaButton("Reset your password", resetLink) +
                mutedParagraph("If you did not request this, you can safely ignore this email.");
        send(toEmail, "Reset your password", wrap("Reset your password", content));
    }

    public void sendContactMessageEmail(String visitorName, String visitorEmail, String visitorPhone, String messageBody) {
        String content =
                paragraph("New message from the website contact form:") +
                contactDetailsCard(visitorName, visitorEmail, visitorPhone) +
                paragraph(escape(messageBody).replace("\n", "<br>")) +
                mutedParagraph("Reply directly to this email to respond to " + escape(visitorName) + ".");
        sendWithReplyTo(contactNotificationEmail, visitorEmail,
                "New contact form message from " + visitorName,
                wrap("New Contact Message", content));
    }

    private void send(String toEmail, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress, "Space Design Group");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send email to {}", toEmail, ex);
            throw new org.springframework.mail.MailSendException("Could not send email to " + toEmail, ex);
        }
    }

    private void sendWithReplyTo(String toEmail, String replyToEmail, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromAddress, "Space Design Group");
            helper.setTo(toEmail);
            helper.setReplyTo(replyToEmail);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send email to {}", toEmail, ex);
            throw new org.springframework.mail.MailSendException("Could not send email to " + toEmail, ex);
        }
    }

    private String wrap(String heading, String contentHtml) {
        return "<!DOCTYPE html>" +
                "<html><head><meta charset=\"UTF-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"></head>" +
                "<body style=\"margin:0;padding:0;background:" + BG_ALT + ";\">" +
                "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:" + BG_ALT + ";padding:32px 16px;\">" +
                "<tr><td align=\"center\">" +
                "<table role=\"presentation\" width=\"560\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:560px;width:100%;background:" + BG + ";border-radius:12px;overflow:hidden;border:1px solid " + LINE + ";\">" +

                "<tr><td style=\"background:" + INK + ";padding:28px 40px;\">" +
                "<span style=\"font-family:" + FONT_DISPLAY + ";font-size:20px;letter-spacing:0.03em;color:" + BG + ";\">Space Design Group</span>" +
                "</td></tr>" +

                "<tr><td style=\"padding:40px 40px 8px 40px;\">" +
                "<h1 style=\"margin:0 0 24px 0;font-family:" + FONT_DISPLAY + ";font-size:24px;color:" + INK + ";font-weight:normal;\">" + escape(heading) + "</h1>" +
                contentHtml +
                "</td></tr>" +

                "<tr><td style=\"padding:24px 40px 32px 40px;\">" +
                "<hr style=\"border:none;border-top:1px solid " + LINE + ";margin:0 0 20px 0;\">" +
                "<p style=\"margin:0;font-family:" + FONT_BODY + ";font-size:12px;color:" + MUTED + ";line-height:1.6;\">" +
                "Space Design Group &middot; Interior design, done right.<br>" +
                "This is an automated message, please do not reply directly to this email." +
                "</p>" +
                "</td></tr>" +

                "</table>" +
                "</td></tr>" +
                "</table>" +
                "</body></html>";
    }

    private String paragraph(String text) {
        return "<p style=\"margin:0 0 20px 0;font-family:" + FONT_BODY + ";font-size:15px;line-height:1.6;color:" + INK + ";\">" + text + "</p>";
    }

    private String mutedParagraph(String text) {
        return "<p style=\"margin:8px 0 0 0;font-family:" + FONT_BODY + ";font-size:13px;line-height:1.6;color:" + MUTED + ";\">" + text + "</p>";
    }

    private String otpBox(String otp) {
        return "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 0 20px 0;\">" +
                "<tr><td style=\"background:" + BG_ALT + ";border:1px solid " + LINE + ";border-radius:8px;padding:18px 32px;\">" +
                "<span style=\"font-family:" + FONT_BODY + ";font-size:32px;letter-spacing:0.3em;color:" + ACCENT + ";font-weight:bold;\">" + escape(otp) + "</span>" +
                "</td></tr>" +
                "</table>";
    }

    private String credentialsCard(String email, String password) {
        return "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 0 20px 0;background:" + BG_ALT + ";border:1px solid " + LINE + ";border-radius:8px;\">" +
                "<tr><td style=\"padding:20px 24px;font-family:" + FONT_BODY + ";font-size:14px;color:" + INK + ";\">" +
                "<div style=\"margin-bottom:10px;\"><span style=\"color:" + MUTED + ";\">Email</span><br>" + escape(email) + "</div>" +
                "<div><span style=\"color:" + MUTED + ";\">Temporary password</span><br><strong>" + escape(password) + "</strong></div>" +
                "</td></tr>" +
                "</table>";
    }

    private String contactDetailsCard(String name, String email, String phone) {
        return "<table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:0 0 20px 0;background:" + BG_ALT + ";border:1px solid " + LINE + ";border-radius:8px;\">" +
                "<tr><td style=\"padding:20px 24px;font-family:" + FONT_BODY + ";font-size:14px;color:" + INK + ";\">" +
                "<div style=\"margin-bottom:10px;\"><span style=\"color:" + MUTED + ";\">Name</span><br>" + escape(name) + "</div>" +
                "<div style=\"margin-bottom:10px;\"><span style=\"color:" + MUTED + ";\">Email</span><br>" + escape(email) + "</div>" +
                "<div><span style=\"color:" + MUTED + ";\">Phone</span><br>" + escape(phone != null && !phone.isBlank() ? phone : "—") + "</div>" +
                "</td></tr>" +
                "</table>";
    }

    private String ctaButton(String label, String url) {
        return "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:4px 0 20px 0;\">" +
                "<tr><td style=\"background:" + ACCENT + ";border-radius:6px;\">" +
                "<a href=\"" + url + "\" style=\"display:inline-block;padding:13px 28px;font-family:" + FONT_BODY + ";font-size:14px;color:" + BG + ";text-decoration:none;font-weight:bold;\">" + escape(label) + "</a>" +
                "</td></tr>" +
                "</table>";
    }

    private String escape(String value) {
        if (value == null) return "";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
