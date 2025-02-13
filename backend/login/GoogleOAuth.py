from flask import session

class GoogleOAuth:
    def __init__(self, app, oauth):
        self.app = app
        self.oauth = oauth
        self.google = self._setup_google()

    def _setup_google(self):
        return self.oauth.register(
            name='google',
            client_id=self.app.config['GOOGLE_CLIENT_ID'],
            client_secret=self.app.config['GOOGLE_CLIENT_SECRET'],
            server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
            client_kwargs={
                'scope': 'openid email profile',
                'prompt': 'select_account'
            },
            access_token_url='https://oauth2.googleapis.com/token',
            authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
            api_base_url='https://www.googleapis.com/oauth2/v2/',
        )

    def logout(self):
        session.pop('state', None)