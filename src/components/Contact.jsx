import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import {
  pageWrapper,
  articleCardClass,
  inputClass,
  labelClass,
  submitBtn,
  errorClass,
  ghostBtn,
} from "../styles/common";

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data) => {
    try {
      // Simulate API call (replace with actual backend endpoint later)
      await new Promise(resolve => setTimeout(resolve, 800));
      setSubmitted(true);
      reset();
      toast.success("Message sent! We'll get back to you soon 🐾");
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className={pageWrapper}>
      {/* Hero */}
      <section className="text-center py-16 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] rounded-3xl mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1d1d1f] mb-4">Get in Touch</h1>
        <p className="text-lg text-[#6e6e73] max-w-2xl mx-auto">
          Have a question, want to volunteer, or need to report an animal in distress? We're here to help.
        </p>
      </section>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className={articleCardClass}>
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#1d1d1f] mb-6">Send us a Message</h2>
            
            {submitted ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-[#1d1d1f] mb-2">Thank You!</h3>
                <p className="text-[#6e6e73] mb-6">Your message has been received. We'll respond within 24-48 hours.</p>
                <button onClick={() => setSubmitted(false)} className={ghostBtn}>Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Your Name *</label>
                    <input {...register("name", { required: "Name is required" })} className={inputClass} placeholder="John Doe" />
                    {errors.name && <p className={errorClass}>{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Email Address *</label>
                    <input type="email" {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })} className={inputClass} placeholder="you@example.com" />
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Subject *</label>
                  <select {...register("subject", { required: "Please select a subject" })} className={inputClass}>
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="report">Report an Animal</option>
                    <option value="volunteer">Volunteer Opportunities</option>
                    <option value="donate">Donation Questions</option>
                    <option value="partner">Partnership/Collaboration</option>
                  </select>
                  {errors.subject && <p className={errorClass}>{errors.subject.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Message *</label>
                  <textarea {...register("message", { required: "Message is required", minLength: { value: 10, message: "Please write at least 10 characters" } })} rows="5" className={inputClass} placeholder="How can we help you?" />
                  {errors.message && <p className={errorClass}>{errors.message.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className={`${submitBtn} w-full`}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-6">
          <div className={`${articleCardClass} p-6 border-l-4 border-[#ff3b30]`}>
            <h3 className="text-lg font-semibold text-[#1d1d1f] mb-3">🚨 Emergency Rescue Hotline</h3>
            <p className="text-[#6e6e73] mb-4">Found an injured or distressed animal? Call us immediately:</p>
            <a href="tel:+919876543210" className="text-2xl font-bold text-[#ff3b30] hover:text-[#d62c23]">+91 98765 43210</a>
            <p className="text-sm text-[#a1a1a6] mt-2">Available 24/7 for urgent cases</p>
          </div>
          <div className={articleCardClass}>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-[#1d1d1f] mb-1">📧 Email</h4>
                <a href="mailto:help@rescuenet.org" className="text-[#0066cc] hover:underline">help@rescuenet.org</a>
              </div>
              <div>
                <h4 className="font-semibold text-[#1d1d1f] mb-1">📍 Office</h4>
                <p className="text-[#6e6e73]">123 Rescue Lane, Indiranagar<br/>Bangalore, Karnataka 560038<br/>India</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#1d1d1f] mb-1">🕒 Office Hours</h4>
                <p className="text-[#6e6e73]">Mon-Sat: 9:00 AM - 6:00 PM IST<br/>Sunday: Emergency only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}