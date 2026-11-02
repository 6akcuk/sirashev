---
title: "Bringing locally running LLM into your NodeJS project"
description: "Introduction   If you want to use AI in your project, it is easy to add the OpenAI ChatGPT..."
publishedAt: "2025-11-03T18:36:05Z"
readingTime: 4
tags: ["ai", "webdev", "javascript", "tutorial"]
sourceUrl: "https://dev.to/sirashev/bringing-locally-running-llm-into-your-nodejs-project-15og"
---

### Introduction
If you want to use AI in your project, it is easy to add the OpenAI ChatGPT library, which provides response and completion endpoints. However, you lack access or prefer not to pay for testing your application's functionality or experimenting with your ideas. In that case, you can download LLM to your local PC/laptop and run it through Docker. I will show you how easily you can implement all the required code.

### Choosing model
First, go and check the Ollama website. It offers numerous LLM models you can download, fine-tune, and use with Ollama. Let's choose `deepseek-r1`, because I've used it in my project. I recommend running all your AI models on a GPU for faster and more effective results. Depending on your GPU memory size, you need to choose a proper model. For example, I have an RTX 4070 Ti with 12 GB, and `deepseek-r1:14b` is the best option for me because it has 9.0 GB size.

![Models list](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ttxqat73umyrl3zhxs27.png)

### Docker containers
If you don't have Docker installed on your machine, visit https://www.docker.com/ and follow the installation guide for your system. Our next step is to bring up the Docker containers for Ollama, which will handle all requests to the AI model, and the Ollama WebUI to manage the models.

```yaml
// docker-compose.yaml
version: '3'  
  
services:  
  ollama:  
    image: ollama/ollama:latest  
    pull_policy: always  
    restart: always  
    ports:  
      - '11434:11434'  
    volumes:  
      - ollama_data:/root/.ollama  
    environment:  
      - OLLAMA_KEEP_ALIVE=24h  
      - OLLAMA_HOST=0.0.0.0  
    deploy:  
      resources:  
        reservations:  
          devices:  
            - capabilities: ["gpu"]  
    networks:  
      - app-network  
  
  ollama-webui:  
    image: ghcr.io/open-webui/open-webui:main
    volumes:  
      - ollama_webui_data:/app/backend/data  
    depends_on:  
      - ollama  
    ports:  
      - 8088:8080  
    environment:  
      - OLLAMA_BASE_URLS=http://host.docker.internal:11434
      - ENV=dev  
      - WEBUI_AUTH=False  
      - WEBUI_NAME=Ollama AI  
      - WEBUI_URL=http://localhost:8088
      - WEBUI_SECRET_KEY=s3cr3t  
    extra_hosts:  
      - host.docker.internal:host-gateway  
    restart: unless-stopped   
    networks:  
      - app-network  
  
volumes:  
  ollama_data:  
  ollama_webui_data:  
  
networks:  
  app-network:
```

Notice the deploy syntax in the Docker Compose file:

```yaml
deploy:  
  resources:  
	reservations:  
	  devices:  
		- capabilities: ["gpu"] 
```

It enables access to a machine GPU for the Docker container, precisely what we need.

### Configuring Ollama
We need to configure the Ollama before using it. Right now, it doesn't have any AI model installed, and you can check it via the Web UI at http://localhost:8088 (you can use another port if you wish). 

![Select a model](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6vs29u9pjk8g82g99aw3.png)

You will see a selector without any model to choose from for now. On this page, click the user's avatar, then select "Admin panel". Navigate to "Settings" and select "Connections" in the left nav menu.

![Admin panel - Settings - Connections](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/i2bn3cm8xtq5mcmt6c1x.png)

Check the "Manage Ollama API Connections" section, which includes the "Manage" button. It will open a popup where you can download any model from Ollama.com. In the "Pull a model from" you can enter a model tag, for example, `deepseek-r1:14b`. 

![Manage Ollama](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/d6fnc9as9q3395qfdqa5.png)

![Manage Ollama - pull a model](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/krbok3hj47v9asejecop.png)

Click on the pull button, it will take some time to download all the required manifest and model files.

![Downloading model](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/19b831gdtjjuqdgml3hz.png)

To confirm the model has successfully downloaded, check it in the "Delete a model" selector. Click on it and check the available models in

![Choose downloaded model](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dy7upf2yuyhojmorbpzb.png)

And now, if you'd like, you can chat with your GPT model in the Ollama Web UI. It will require some time to analyze and produce an answer to you, because you don't have enough (or have 😮) power.

![New chat with downloaded model](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wxnodt1vva8w0u025nbl.png)

### Using your own hosted LLM model
It is time to check how it is working. To integrate into your own NodeJS project, you need to install the `ollama` package.

```bash
npm add ollama
```

To enable it and make a first request with your prompt, initialize a new `ollama` instance and send a chat request with proper params:

```ts
const ollama = new Ollama({
	host: 'http://localhost:11434', // type your host or IP address
});

const response = await ollama.chat({
	model: 'deepseek-r1:14b', // write your model
	messages: [
		{
			role: 'system',
			content: 'Your prompt for GPT model',
		},
		{
			role: 'user',
			content: 'User message'
		}
	],
	format: 'json',
});

const data: YourData = JSON.parse(response.message.content);
```

`YourData` is a type for your concrete data. It will help you type the response generated by the GPT model. 

### Conclusions
And that's it. It's a locally running LLM model, but you can run it on another machine and connect to it. What did I do? I bought a static IP address from my local ISP, ran the LLM model and container on my Windows PC with an RTX card, and connected to it from my running server. It is suitable for a pet project but not for production, and it can still be a good starting point for testing your ideas and finding the best solution. Good luck to you!

Photo by [Aerps.com](https://unsplash.com/@almoya?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/laptop-screen-showing-a-search-bar-bUUrG6CMHiA?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText)
    
