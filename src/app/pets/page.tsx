'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  weight: string;
  color: string;
  health_status: string;
  vaccination_status: boolean;
  neutered: boolean;
  description: string;
  photos: string[];
  status: string;
  shelter_id: string;
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    species: '',
    gender: '',
  });
  const limit = 12;

  useEffect(() => {
    fetchPets();
  }, [page, filters]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: 'available',
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (filters.species) params.append('species', filters.species);
      if (filters.gender) params.append('gender', filters.gender);

      const res = await fetch(`/api/pets?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setPets(data.pets);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('获取宠物列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-rose-500" fill="currentColor" />
              <span className="text-xl font-bold text-gray-900">PetTrust</span>
            </Link>
            <Link href="/login">
              <Button>登录</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">待领养宠物</h1>
          <p className="text-gray-600">
            {total} 只可爱的毛孩子正在等待一个温暖的家
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">筛选:</span>
            </div>
            <Select
              value={filters.species}
              onValueChange={(value) => {
                setFilters({ ...filters, species: value === 'all' ? '' : value });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="种类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部种类</SelectItem>
                <SelectItem value="狗">狗</SelectItem>
                <SelectItem value="猫">猫</SelectItem>
                <SelectItem value="其他">其他</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.gender}
              onValueChange={(value) => {
                setFilters({ ...filters, gender: value === 'all' ? '' : value });
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="性别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部性别</SelectItem>
                <SelectItem value="male">公</SelectItem>
                <SelectItem value="female">母</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pet Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">暂无符合条件的宠物</h3>
            <p className="text-gray-600">试试调整筛选条件</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pets.map((pet) => (
                <Link key={pet.id} href={`/pets/${pet.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                    <div className="aspect-square bg-gray-100 relative">
                      {pet.photos && pet.photos.length > 0 ? (
                        <img
                          src={pet.photos[0]}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                      <Badge className="absolute top-3 right-3 bg-green-500">
                        可领养
                      </Badge>
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="text-lg font-semibold mb-2">{pet.name}</h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                        <Badge variant="outline">{pet.species}</Badge>
                        {pet.breed && <Badge variant="outline">{pet.breed}</Badge>}
                        <Badge variant="outline">{pet.age}个月</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {pet.gender === 'male' ? '公' : '母'}
                        </Badge>
                        {pet.neutered && (
                          <Badge variant="secondary" className="text-xs">
                            已绝育
                          </Badge>
                        )}
                        {pet.vaccination_status && (
                          <Badge variant="secondary" className="text-xs">
                            已疫苗
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
                <span className="text-sm text-gray-600">
                  第 {page} / {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
