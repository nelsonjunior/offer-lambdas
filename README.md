# Projeto Integrado - Offer – Sistema de Ofertas em Lojas Físicas

### Introdução

Esse repositório contempla a implementação de lambdas funcictions responsáveis por partes dos fluxos da
plataforma Offer.

### Lambda Category List

O lambda Category List é responsável por listar as categorias de ofertas.

### Lambda Store Create

O lambda Store Create é responsável por criar uma loja física após a confirmação do cadastro ser realizada
no Amazon Cognito.

### Lambda Store Get

O lambda Store Get é responsável por obter uma loja.

### Lambda Store Update

O lambda Store Update é responsável por atualizar uma loja, esse processo deve ser realizado antes da
primeira publicação de oferta pelo usuário.

### Lambda Upload Get Signed URL

O lambda Upload Get Signed URL é responsável por gerar uma URL assinada para upload de images.

### Lambda Upload Move Images

O lambda Upload Move Images é responsável por mover as imagens de uma oferta do bucket de upload para o bucket de imagens

### Tecnologias

* AWS Api Gateway
* AWS Lambda
* AWS Cognito
* Amazon DynamoDB
* SNS
* S3
* Node
* Typescript
