namespace ClubeDoAlbum.Api.Common;

public static class ClassificacaoNotaHelper
{
    public static string ObterClassificacao(decimal nota)
    {
        return nota switch
        {
            < 2.0m => "Absolute Porcaria",
            < 4.0m => "Ruim",
            < 5.0m => "Meia Boca", // Note: 4.0 a 5.9
            < 6.0m => "Meia Boca",
            < 7.0m => "Bom",
            < 8.0m => "É o Aço",
            _ => "Masterpiece"
        };
    }
}
