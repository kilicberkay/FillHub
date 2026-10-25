# Chrome Web Store listing: FillHub (Português do Brasil)

**Name:** FillHub

**Summary (132 characters max):**
Preencha formulários web com dados fictícios realistas e consistentes em 15 idiomas. Modo seguro, desfazer e sem coleta de dados.

## Description

O FillHub preenche formulários web com dados fictícios realistas e consistentes. Desenvolvedores e testadores podem testar fluxos de cadastro, compra e entrada de dados sem digitar valores de teste à mão e sem usar dados de pessoas reais.

Destaques

- 15 idiomas e 15 perfis de país. Nomes, endereços, números de telefone, nomes de empresas e números de identidade seguem o formato de cada país.
- Dados de pessoa consistentes. Cada preenchimento cria uma única pessoa. Por isso, nome, sobrenome, e-mail, o campo "Confirmar e-mail", nome de usuário e telefone combinam entre si.
- Detecção inteligente de campos. O FillHub combina o rótulo, o nome do campo, as dicas de preenchimento automático e o tipo de entrada para identificar cada campo. Rótulos em outros idiomas também são reconhecidos. Por exemplo, um campo em turco com o rótulo "Cep telefonu" (celular) recebe um número de telefone, e um campo com o rótulo "Soyadınız" (seu sobrenome) recebe um sobrenome.
- Modo PII Safe (ativado por padrão). Identificadores pessoais usam valores de teste evidentes: endereços de e-mail example.com, números de telefone fictícios e números de identidade de teste que não se destinam a uso real.
- Perfis de identidade. Use uma nova pessoa aleatória a cada preenchimento ou mantenha uma pessoa fixa. Um perfil pode fixar nome, sobrenome, e-mail, telefone e senha, para que a mesma conta de teste seja usada em todos os preenchimentos.
- Regras personalizadas. Associe um seletor CSS a um tipo de dado quando a detecção integrada não reconhecer um campo. As regras são editadas na página de configurações.
- As caixas de consentimento (termos de uso, política de privacidade e consentimento KVKK previsto na lei turca de proteção de dados) são marcadas. As caixas de marketing permanecem desmarcadas.
- Campos de texto recebem frases de exemplo no idioma do país, encurtadas até o tamanho máximo do campo.
- Campos de arquivo recebem um pequeno arquivo gerado que corresponde ao tipo de arquivo aceito.
- O envio automático (opcional, desativado por padrão) clica no botão de envio real do formulário preenchido. Botões destrutivos, como Cancelar ou Excluir, nunca são clicados. Sites específicos podem ser excluídos do envio automático.
- Captchas nunca são clicados nem resolvidos. Um captcha visível é destacado com uma moldura para que você o conclua. Nesse caso, o formulário não é enviado automaticamente.
- O modo caos preenche os campos com valores incomuns para testes do tipo fuzz.
- A função Desfazer restaura o formulário ao estado anterior ao último preenchimento.
- As configurações podem ser salvas em um arquivo JSON local. O relatório de diagnóstico para relatar erros contém contagens e configurações básicas, mas nenhum nome, valor de campo ou endereço de site.
- Funciona em iframes da mesma origem e mantém os valores sincronizados com frameworks JavaScript. Iframes de outra origem ficam fora da permissão activeTab e não são preenchidos.

Como usar

1. Abra uma página com um formulário.
2. Pressione Ctrl+Shift+F (Command+Shift+F no macOS) ou clique no ícone do FillHub na barra de ferramentas. O formulário é preenchido imediatamente.
3. Pressione Ctrl+Shift+U (Command+Shift+U no macOS) para desfazer o preenchimento.
4. Pressione Ctrl+Shift+Y (Command+Shift+Y no macOS) para preencher o formulário no modo caos, com valores incomuns para testes do tipo fuzz.

Os atalhos podem ser alterados em chrome://extensions/shortcuts. Para preencher um único campo, clique com o botão direito no campo e escolha "Preencher este campo".

Privacidade

O FillHub não coleta dados nem faz requisições de rede. As configurações ficam armazenadas apenas no seu navegador. A extensão não envia nada ao autor nem a terceiros. Política de privacidade: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Código aberto

O FillHub é gratuito e de código aberto sob a licença MIT. Código-fonte, relatos de problemas e contribuições: https://github.com/kilicberkay/FillHub

Apoio

O FillHub é gratuito. Se o FillHub for útil no seu trabalho, você pode apoiar o desenvolvimento pelo GitHub Sponsors: https://github.com/sponsors/kilicberkay

Uso responsável

O FillHub é destinado a testes e desenvolvimento. Números de identidade gerados podem passar nas regras públicas de dígito verificador. Não use dados gerados em solicitações reais, compras ou verificações de identidade.
