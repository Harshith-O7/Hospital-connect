import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private genAI: GoogleGenAI | null = null;
  
  constructor() {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
        this.genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
        console.warn("API_KEY environment variable not found. Gemini Service will not be available.");
    }
  }

  async checkSymptoms(symptoms: string): Promise<string> {
    if (!this.genAI) {
      return Promise.reject(new Error("Gemini AI client is not initialized. Ensure API_KEY is set."));
    }

    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a helpful medical information assistant.
      Based on the symptoms provided, you should list potential related conditions or areas to discuss with a doctor.
      You must not provide a diagnosis. Your primary goal is to inform and suggest topics for a professional consultation.
      Your response MUST start with a clear, bold disclaimer: "DISCLAIMER: This is not a medical diagnosis. The information provided is for informational purposes only and should not be considered a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition."
      After the disclaimer, provide the information in a clear, easy-to-read format. Use bullet points where appropriate.`;
      
    try {
      const response = await this.genAI.models.generateContent({
        model,
        contents: symptoms,
        config: {
          systemInstruction,
        }
      });

      return response.text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (error instanceof Error) {
        return `An error occurred while analyzing symptoms: ${error.message}`;
      }
      return 'An unknown error occurred while analyzing symptoms. Please try again later.';
    }
  }

  async scheduleAppointment(request: string): Promise<any> {
    if (!this.genAI) {
      return Promise.reject(new Error("Gemini AI client is not initialized. Ensure API_KEY is set."));
    }

    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an intelligent hospital appointment scheduling assistant.
      Your task is to parse the user's request and extract key information for scheduling an appointment.
      Extract the doctor's name, patient's name, requested type of appointment, and any time preferences (like a day, date, or time of day).
      If a specific date is mentioned (e.g., "August 15, 2024", "2024-08-15", "today"), extract it and format it as YYYY-MM-DD into the 'preferredDate' field.
      If a piece of information is not present, omit the key.`;

    try {
      const response = await this.genAI.models.generateContent({
        model,
        contents: request,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              doctorName: {
                type: Type.STRING,
                description: 'The full name of the doctor requested.',
              },
              patientName: {
                type: Type.STRING,
                description: "The full name of the patient.",
              },
              appointmentType: {
                type: Type.STRING,
                description: 'The type of appointment, e.g., "check-up", "consultation", "follow-up".',
              },
              timePreference: {
                type: Type.STRING,
                description: 'Any preference for the date or time, e.g., "next Tuesday afternoon", "tomorrow morning".',
              },
              preferredDate: {
                type: Type.STRING,
                description: 'The specific date requested for the appointment, in YYYY-MM-DD format. Extract this from phrases like "on 2024-08-15" or from a specific date mentioned.',
              },
            }
          }
        }
      });
      
      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error calling Gemini API for scheduling:', error);
      throw new Error('Failed to parse appointment request. Please try rephrasing your request.');
    }
  }
}