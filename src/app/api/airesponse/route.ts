import { NextRequest,NextResponse } from "next/server";
import { AzureOpenAI } from "openai"

const endpoint = process.env['NEXT_PUBLIC_OPENAI_API_ENDPOINT'];
const apiKey = process.env['NEXT_PUBLIC_OPENAI_API_KEY'];
const apiVersion: string = "2024-04-01-preview";
//const deployment: string = "PipelineLogAnalyzer-gpt-35-turbo";
const deployment: string = "PipelineLogAnalyzer-gpt-4o-2024-08-06";

export async function POST(request:NextRequest) {
    const reqBody  = await request.json();
    const errorDetails = reqBody.errorlinekey;
    const prompt = `Analyze the following error lines and provide a troubleshooting steps on how i can resolve this error in my azure devops pipeline:\n\n${JSON.stringify(errorDetails, null, 2)}`;
    const client = new AzureOpenAI({ 
        endpoint, 
        apiKey, 
        apiVersion, 
        deployment,
        dangerouslyAllowBrowser: true, 
      });

      try{
        //const result = await client.completions.create({ 
        const result = await client.chat.completions.create({ 
          //prompt, 
          messages: [
            {
            role: 'system',
            content: 'You are a troubleshooting bot that gives advice to azure devops support enginner that are trying to troubleshoot their azure devops ci/cd pipelines. Based on the error lines that the User provided for troubleshooting give them suggestions on how to resolve the error.'
            },
            {
            role: 'user',
            content: prompt
            }
        ],
          model: deployment, 
          max_tokens: 4000
        });
        for (const choice of result.choices) {
          //console.log(choice.text);
          //console.log(choice.message)
      }
      //const responseText = result.choices[0].text || '';
      const responseText = result.choices[0].message.content || '';
      return NextResponse.json({result:responseText},{status:200});
       //return NextResponse.json({result:prompt},{status:200});
     }
      catch (error: any) {
        console.error('AI Response Error:', error.response?.data || error.message);
        return NextResponse.json({ error: error.response?.data || error.message }, { status: 500 });
    }
    
};
