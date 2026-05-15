export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string | null;
  text: string;
  timestamp: any;
  type?: "text" | "alert";
  reactions?: Record<string, string[]>;
}
