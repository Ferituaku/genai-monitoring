class MLProject :
    def __init__(self
                , owner, projectname, teams_webhook_url, list_mention, file_sharing, url_mlflow, usrnm_mlflow, pass_mlflow):
        # project
        self.owner       = owner
        self.projectname = projectname
        self.teams_webhook_url = teams_webhook_url
        self.list_mention = list_mention
        self.file_sharing = file_sharing
        self.url_mlflow = url_mlflow
        self.usrnm_mlflow = usrnm_mlflow
        self.pass_mlflow = pass_mlflow

evaluation = MLProject(
                # project
                owner = "GENAI"
                , projectname = "GenAI"
                , teams_webhook_url  = "https://astrainternational.webhook.office.com/webhookb2/8d169a3f-2819-46c3-b05a-1fe27c02c2cb@5a0b86e1-3af7-4d16-a63e-afe55beab795/IncomingWebhook/98ee6394a1f643369769dea03cc4781d/d14b2040-d2e9-4597-9e8d-a9128af9a84e/V2xt3hxOFww1Ni2bmvnpjwvkwaWrhCPvA6twDurCfV-f81" 
                , list_mention = ["reni.handayani@ai.astra.co.id"]
                , file_sharing=r"\\a000s-itfs04\rpaastra\testing\MLOps"
                , url_mlflow = 'https://devproxy.astra.co.id/openai/mlops/'
                , usrnm_mlflow= 'admin'
                , pass_mlflow= 'password'
           )


