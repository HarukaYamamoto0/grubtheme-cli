# roadmap

## Na primera execução
1. criar a imagem
2. criar uma tabela MBR e a partição bootável.
3. abrir a imagem como loop device
   1. formatar a partição bootável como ext2
   2. montar a imagem e seu filesystem 
      1. instalar o GRUB
      2. atualizar o `grub.cfg`
      3. copiar o tema alvo para a imagem
   3. desmontar a imagem
4. fechar o loop device

## Nas próximas execuções

1. check se a imagem existe
2. abrir a image como loop device
   1. montar a imagem e seu filesystem
      1. copiar o tema alvo para a imagem
   2. desmontar a image e seu filesystem
3. fechar o loop device

## Comandos

### preview

O comando principal do