namespace ClubeDoAlbum.Api.Common;

/// <summary>
/// Helper para cálculos matemáticos e regras de negócio de notas do Clube do Álbum.
/// </summary>
public static class CalculoNotaHelper
{
    public const decimal PesoCurador = 0.5m;
    public const decimal PesoMembro = 1.0m;

    /// <summary>
    /// Calcula a média ponderada das notas atribuídas a um álbum.
    /// Regra de Negócio: Se a nota for do próprio curador que indicou o álbum,
    /// ela recebe peso 0.5 (metade do peso) para evitar viés. As notas dos demais
    /// membros recebem peso normal 1.0.
    /// </summary>
    /// <param name="avaliacoes">Lista de tuplas (UserId, Nota) de quem avaliou o disco.</param>
    /// <param name="indicadoPorUserId">ID do membro que indicou o álbum (se houver).</param>
    /// <returns>Média ponderada arredondada em 1 casa decimal.</returns>
    public static decimal CalcularMediaPonderada(IEnumerable<(Guid UserId, decimal Nota)> avaliacoes, Guid? indicadoPorUserId)
    {
        decimal somaPonderada = 0m;
        decimal somaPesos = 0m;

        foreach (var (userId, nota) in avaliacoes)
        {
            decimal peso = (indicadoPorUserId.HasValue && userId == indicadoPorUserId.Value)
                ? PesoCurador
                : PesoMembro;

            somaPonderada += nota * peso;
            somaPesos += peso;
        }

        return somaPesos > 0m ? Math.Round(somaPonderada / somaPesos, 1) : 0m;
    }
}
