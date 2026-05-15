# Plano: Splash Screen Estilo YouTube

## Objetivo
Implementar uma splash screen animada similar ao YouTube, onde a logo se transforma em uma barra de progresso que carrega até completar antes de navegar para a Home.

## Descrição da Animação
A animação do YouTube consiste em:
1. Logo aparece na tela
2. Logo se "espreme" horizontalmente até virar uma barra
3. Barra de progresso colorida preenche da esquerda para direita
4. Ao completar, splash screen desaparece e Home aparece

## Implementação Sugerida

### Opção 1: Transformação Completa (Complexo)
Animação CSS onde a logo (emoji 📚 ou imagem) se transforma geometricamente em barra.

**Componentes necessários:**
- Animação SVG de transformação da logo
- Keyframes CSS para espremer horizontalmente
- Barra de progresso com cores da marca (amarelo/verde)
- Timing coordenado (2-3 segundos)

**Desafios:**
- Transformação geométrica complexa
- Coordenar timing perfeito
- Suporte cross-browser

### Opção 2: Barra de Progresso Abaixo da Logo (Simplificado)
Manter a logo estática e adicionar barra de progresso animada abaixo.

**Componentes necessários:**
- Logo estática (📚 ou imagem)
- Barra de progresso animada abaixo
- Cores da marca (amarelo para progresso, cinza para fundo)
- Timing de 2,5 segundos (igual ao timer atual)

**Vantagens:**
- Implementação mais simples
- Efeito visual similar
- Fácil de manter

## Estrutura de Arquivos

### Modificações em `frontend/src/pages/WelcomePage.tsx`

```typescript
// Adicionar estado para controlar progresso
const [progress, setProgress] = useState(0)

// useEffect para animar progresso
useEffect(() => {
  const interval = setInterval(() => {
    setProgress(prev => {
      if (prev >= 100) {
        clearInterval(interval)
        return 100
      }
      return prev + (100 / 25) // 100% em 2.5s (40ms * 25)
    })
  }, 100)
  
  return () => clearInterval(interval)
}, [])

// Navegar quando progresso completar
useEffect(() => {
  if (progress === 100) {
    navigate('/')
  }
}, [progress, navigate])
```

### JSX da Barra de Progresso

```jsx
{/* Barra de Progresso */}
<div className="w-full max-w-xs mx-auto mt-8">
  <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
    <div 
      className="h-full bg-yellow-400 transition-all duration-100 ease-linear"
      style={{ width: `${progress}%` }}
    />
  </div>
  <p className="text-center text-sm text-gray-500 mt-2">
    Carregando... {Math.round(progress)}%
  </p>
</div>
```

## Cores da Marca
- **Primária:** Amarelo (#facc15 ou yellow-400)
- **Secundária:** Verde (#22c55e ou green-500)
- **Fundo da barra:** Cinza claro (#d1d5db ou gray-300)

## Timing
- **Duração total:** 2,5 segundos
- **Intervalo de atualização:** 100ms
- **Incremento por frame:** 100 / 25 = 4%

## Considerações de UX
1. **Feedback visual:** Mostrar porcentagem de progresso
2. **Acessibilidade:** Adicionar aria-valuenow e aria-valuemax
3. **Performance:** Usar transform em vez de width para melhor performance
4. **Fallback:** Mostrar mensagem de erro se demorar muito

## Próximos Passos
1. [ ] Decidir entre Opção 1 (complexa) ou Opção 2 (simplificada)
2. [ ] Implementar versão escolhida em WelcomePage.tsx
3. [ ] Testar animação em diferentes dispositivos
4. [ ] Ajustar timing e cores conforme necessário
5. [ ] Commit e deploy

## Referências
- YouTube Splash Screen Animation
- CSS Keyframes Documentation
- React Transition Group
