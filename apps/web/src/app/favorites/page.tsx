import { ProblemList } from "../../components/problem-list";
import { Badge } from "../../components/ui/badge";
import { buttonVariants } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { getCookieHeader, getOptionalSessionUser } from "../../lib/auth";
import { getFavorites } from "../../lib/api";

export default async function FavoritesPage() {
  const user = await getOptionalSessionUser();

  if (!user) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="flex flex-col gap-4 p-8">
          <Badge variant="outline" className="w-fit">
            需要登录
          </Badge>
          <CardTitle className="text-2xl font-bold">登录后查看你的收藏题目</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-8 pb-8 pt-0">
          <p className="text-muted-foreground">
            收藏列表会跟随账号保存，这个页面仅对已登录用户开放。
          </p>
          <a href="/auth?mode=login&returnTo=/favorites" className={buttonVariants({ className: "w-fit" })}>
            前往登录
          </a>
        </CardContent>
      </Card>
    );
  }

  const favorites = await getFavorites(await getCookieHeader());

  return (
    <>
      <section className="container mx-auto flex flex-col gap-3 px-4 pb-0 pt-6 md:px-6 lg:px-8">
        <Badge variant="secondary" className="w-fit font-bold">
          我的收藏
        </Badge>
        <div className="border-b border-border pb-6">
          <h1 className="text-2xl font-bold tracking-tight">收藏的题目</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            当前共收藏 {favorites.length} 道题，取消收藏后会立即从当前列表移除。
          </p>
        </div>
      </section>

      <ProblemList
        problems={favorites}
        initialFavoriteIds={favorites.map((problem) => problem.id)}
        favoritesLoaded
        favoritesOnly
        emptyStateMessage="你还没有收藏任何题目。"
      />
    </>
  );
}
