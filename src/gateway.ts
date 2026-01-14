import { streamText } from 'ai';
import 'dotenv/config';

async function main() {
  const result = streamText({
    model: 'openai/gpt-4.1',
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  console.log();
  console.log(' Số token đã sử dụng:', await result.usage);
  console.log('Lý do kết thúc:', await result.finishReason);
}

main().catch(console.error);