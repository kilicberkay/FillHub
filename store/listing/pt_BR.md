# Chrome Web Store listing: FillHub (Português do Brasil)

**Name:** FillHub

**Summary (132 characters max):**
Preencha formulários web com dados fictícios realistas e consistentes em 15 idiomas. Modo seguro, desfazer e sem coleta de dados.

## Description

O FillHub preenche formulários web com dados fictícios realistas e consistentes, para que desenvolvedores e testadores possam testar fluxos de cadastro, compra e entrada de dados sem digitar valores de teste à mão nem usar dados reais de pessoas.

Destaques

- 15 idiomas e 15 perfis de país. Nomes, endereços, números de telefone, nomes de empresas e números de identidade seguem o formato de cada país.
- Pessoas consistentes. Cada preenchimento cria uma pessoa, então nome, sobrenome, e-mail, o campo "repetir e-mail", o nome de usuário e o telefone combinam entre si.
- Detecção inteligente de campos. Rótulos, nomes, dicas de preenchimento automático e tipos de entrada são combinados, então um campo com o rótulo "Cep telefonu" ou "Soyadınız" recebe o valor certo.
- Modo PII Safe (ativado por padrão). Identificadores pessoais usam valores de teste óbvios: e-mails example.com, telefones de marcação e números de identidade de teste que nunca devem ser usados de verdade.
- Perfis de identidade. Use uma pessoa aleatória nova a cada preenchimento ou mantenha uma pessoa fixa. Um perfil pode fixar nome, sobrenome, e-mail, telefone e senha, por isso pode guardar uma conta de teste fixa.
- Regras personalizadas. Associe um seletor CSS a um tipo de dado quando a detecção embutida não reconhece um campo. As regras são editadas na página de configurações.
- As caixas de consentimento (termos, privacidade, KVKK) são marcadas; as caixas de marketing permanecem desmarcadas.
- Campos de texto recebem frases de exemplo no idioma do país, cortadas no tamanho máximo do campo.
- Campos de arquivo recebem um pequeno arquivo gerado que corresponde ao tipo aceito.
- O envio automático opcional (desativado por padrão) clica no botão de envio real do formulário preenchido. Botões destrutivos como Cancelar ou Excluir nunca são clicados, e sites podem ser excluídos.
- Captchas nunca são clicados nem resolvidos. Um captcha visível é destacado, você o conclui e o formulário não é enviado automaticamente.
- Modo caos para testes do tipo fuzz com valores incomuns.
- Desfazer restaura o formulário ao estado anterior ao último preenchimento.
- Backup das configurações em um arquivo JSON local e um relatório de diagnóstico que contém apenas contagens.
- Funciona em iframes da mesma origem, lê os rótulos no idioma da própria página e mantém os valores sincronizados com frameworks JavaScript. Iframes de outra origem ficam fora da permissão activeTab e não são alterados.

Como usar

1. Abra uma página com um formulário.
2. Pressione Ctrl+Shift+F (Command+Shift+F no macOS) ou clique no ícone do FillHub na barra de ferramentas. O formulário é preenchido imediatamente.
3. Pressione Ctrl+Shift+U para desfazer.
4. Pressione Ctrl+Shift+Y para o modo caos (valores incomuns para testes do tipo fuzz).

Os atalhos podem ser alterados em chrome://extensions/shortcuts. Clique com o botão direito em um único campo e escolha "Preencher este campo" para preencher apenas esse campo.

Privacidade

O FillHub não coleta dados. As configurações ficam no seu navegador. A extensão não envia nada ao autor nem a terceiros. Veja a política de privacidade: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Código aberto

O FillHub é gratuito e de código aberto sob a licença MIT. Código-fonte, problemas e contribuições: https://github.com/kilicberkay/FillHub

Apoio

O FillHub é gratuito. Se ele ajuda no seu trabalho, você pode apoiar o desenvolvimento pelo GitHub Sponsors: https://github.com/sponsors/kilicberkay

Uso responsável

O FillHub é para testes e desenvolvimento. Números de identidade gerados podem passar nas regras públicas de somas de verificação, então não use dados gerados em aplicações reais, compras ou declarações de identidade.
