export class CreatePostDto {
  content: string;
  parent_id?: number;
  media?: string[];
}
