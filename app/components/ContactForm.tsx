"use client";

import { useState, FormEvent } from "react";

type ContactFormProps = {
  onClose: () => void;
};

export function ContactForm({ onClose }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    website: "", // Honeypot field - should remain empty
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Message sent successfully! I'll get back to you soon.",
        });
        setFormData({ name: "", email: "", message: "", website: "" });
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus({ type: null, message: "" });
        }, 5000);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "An error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "32px",
      }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="name"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#cccccc",
            }}
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              background: "#1e1e1e",
              border: "1px solid #3d3d3d",
              borderRadius: "8px",
              color: "#cccccc",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#0078d4";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#3d3d3d";
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="email"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#cccccc",
            }}
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              background: "#1e1e1e",
              border: "1px solid #3d3d3d",
              borderRadius: "8px",
              color: "#cccccc",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#0078d4";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#3d3d3d";
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="message"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#cccccc",
            }}
          >
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            value={formData.message}
            onChange={handleChange}
            disabled={isSubmitting}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              background: "#1e1e1e",
              border: "1px solid #3d3d3d",
              borderRadius: "8px",
              color: "#cccccc",
              fontFamily: "inherit",
              resize: "vertical",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#0078d4";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#3d3d3d";
            }}
          />
        </div>

        {/* Honeypot field - hidden from users, but bots will fill it */}
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
            opacity: 0,
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <label htmlFor="website">Website (leave blank)</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={handleChange}
          />
        </div>

        {submitStatus.type && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: "24px",
              borderRadius: "8px",
              background:
                submitStatus.type === "success"
                  ? "rgba(0, 200, 83, 0.1)"
                  : "rgba(244, 67, 54, 0.1)",
              border: `1px solid ${
                submitStatus.type === "success" ? "#00c853" : "#f44336"
              }`,
              color:
                submitStatus.type === "success" ? "#00c853" : "#f44336",
              fontSize: "14px",
            }}
          >
            {submitStatus.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: "100%",
            padding: "14px 24px",
            fontSize: "16px",
            fontWeight: "600",
            background: isSubmitting ? "#3d3d3d" : "#0078d4",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "background 0.2s, transform 0.1s",
            opacity: isSubmitting ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background = "#0063b1";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.background = "#0078d4";
            }
          }}
          onMouseDown={(e) => {
            if (!isSubmitting) {
              e.currentTarget.style.transform = "scale(0.98)";
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}

