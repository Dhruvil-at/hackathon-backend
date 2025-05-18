import axios from 'axios';

export class BasecampService {
  private static basecampUrl =
    'https://3.basecamp.com/4767616/integrations/4VKWvFaE6NDLrhSMQXSXkWY1/buckets/18168890/chats/2894341437/lines';

  static async sendMessage(message: string): Promise<void> {
    try {
      await axios.post(
        this.basecampUrl,
        new URLSearchParams({
          content: message,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (error) {
      console.error('Failed to send message to Basecamp:', error);
      throw new Error('Failed to send message to Basecamp');
    }
  }
}
