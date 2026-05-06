document.getElementById("summarizeBtn").addEventListener("click", () => {
    const resultDiv =document.getElementById("result");
    const sumamaryType = document.getElementById("summaryType").value;
    resultDiv.innerHTML ='<div class="loader"></div>';

    //GET USER API KEY

    chrome.storage.sync.get(["geminiApikey"], ({ geminiapiKey }) => {
        if(!geminiapiKey){
            resultDiv.textContent="No API key found. Please set your Gemini API key in the options.";
            return;
        }

    // ASK CONTENT.JS FOR THE PAGE TEXT
        chrome.tabs.query({active: true, currentWindow: true}, ([tabs]) => {
        
            chrome.tabs.sendMessage(tabs.id,{type:"GET_ARTICLE_TEXT"},({text}) => {
                if(!text){
                    resultDiv.textContent="No text found on this page.";
                    return;
                }
                //SEND TEXT TO GEMINI

                try{
                    const summary=await getGeminiSummary(
                        text,
                        sumamaryType,
                        geminiapiKey
                    );

                    resultDiv.textContent=summary;
                }catch(error){
                    resultDiv.textContent="Gemini error:"+error.message;
                }
            }

        );
    });

});
});

async function getGeminiSummary(rawText,type,apiKey){
    const max= 20000;
    const text = rawText.length > max ? rawText.slice(0, max)+ "..." : rawText;
    
    const promptMap={
        breif:`Summarize the following text briefly:\n\n${text}`,
        detailed:`Summarize the following text in detail:\n\n${text}`,
        bullet:`Summarize the following text in bullet points:\n\n${text}`,
    };

    const prompt = promptMap[type] || promptMap.breif;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}',{
        method:'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify({
            contents:[{parts:[{text:prompt}]}],
            generationConfig:{temperature:0.2},
        }),
    }
    );

    if(!res.ok){
        const{error}= await res.json();
        throw new Error(error?.message || "Request failed");
    }

    const date =await res.json();
    return DataTransfer.candidate?.[0]?.content?.parts?.[0]?.text ?? "No summary generated";


}